package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"runtime"
	"strconv"
	"sync"
	"time"

	"goTool/domain"
	"goTool/domain/domainMessage"
	"goTool/generic"
	"goTool/infrastructure/bddAccess"
	"goTool/interface/mapper"
	"goTool/utilities"

	"github.com/lib/pq"
	"github.com/mvrahden/go-test/pkg/gotest"
)

const (
	USER_ID             = "01234567"
	USER_EMAIL          = "alice@example.com"
	USER_ROLE           = "ADMIN"
	DETAIL_ERROR        = "Erreur détaillée"
	ERROR               = "Erreur à l'exécution"
	ADDITIONAL_ERROR    = "Erreur supplémentaire"
	TOKEN_INVALID_ERROR = "Erreur token incorrecte ou pas de token"
)

type httpServiceMock struct {
	serverIsStop bool
}

func (s *httpServiceMock) ServerStart()        { s.serverIsStop = false }
func (s *httpServiceMock) ServerStop()         { s.serverIsStop = true }
func (s httpServiceMock) ServerIsStop() bool   { return s.serverIsStop }
func (s *httpServiceMock) StopServerOnSignal() {}

type authServiceMock struct{}

func (service authServiceMock) Verify(token string, tokenCheck domain.TokensCheck) (*domain.ConnectedUser, error) {
	if token == VALID_TOKEN {
		connectedUser := domain.CreateConnectedUser(USER_ID, USER_EMAIL, USER_ROLE)
		return connectedUser, nil
	}
	return nil, domainMessage.TokenErrorf(TOKEN_INVALID_ERROR)
}

type concurrentCaller struct {
	group       sync.WaitGroup
	lockManager sync.Mutex
	caller      handlerCaller
	results     []any
}

func (caller *concurrentCaller) getResponseResults() []any { return caller.results }
func (caller *concurrentCaller) waitCallsDone()            { caller.group.Wait() }

func (caller *concurrentCaller) call(request *http.Request, handlerFunc func(http.ResponseWriter, *http.Request), result any) {
	caller.group.Add(1)
	go func() {
		defer caller.group.Done()
		caller.caller.Call(request, handlerFunc, &result)

		// Le tableau results est lu et modifié par plusieurs go routine. Il faut donc un verrou
		caller.lockManager.Lock()
		defer caller.lockManager.Unlock()
		caller.results = append(caller.results, result)
	}()
}

func concurrentHttpCaller() concurrentCaller {
	fmt.Printf("%v processeurs sur cette machine ", runtime.NumCPU())
	return concurrentCaller{caller: handlerCaller{}}
}

type handlerCaller struct{}

func (s handlerCaller) Call(request *http.Request, handlerFunc func(http.ResponseWriter, *http.Request), result any) (statusCode int) {
	responseRecorder := httptest.NewRecorder()
	handlerFunc(responseRecorder, request)
	response := responseRecorder.Result()
	defer func() {
		_ = response.Body.Close()
	}()
	_ = json.NewDecoder(response.Body).Decode(result)
	return response.StatusCode
}

type HandlerTestSuite struct {
	bddProvider *generic.DataAccessProviderMock
}

// BeforeEach : pour chaque fonction TestXxx(t *gotest.T), PAS pour chaque t.It
func (s *HandlerTestSuite) BeforeEach(t *gotest.T) {
	InitAuthService(authServiceMock{})
	InitServerService(&httpServiceMock{})
	srvService.ServerStart()
	s.bddProvider = &generic.DataAccessProviderMock{}
}

// AfterEach : pour chaque fonction TestXxx(t *gotest.T), PAS pour chaque t.It
func (s *HandlerTestSuite) AfterEach(t *gotest.T) {
	srvService.ServerStop()
}

func (s *HandlerTestSuite) TestGetHandler(t *gotest.T) {
	t.It("Vérification de l'exécution d'une méthode sans paramètre", func(it *gotest.T) {
		sayHello := func(ctx context.Context) (string, error) {
			return "Hello", nil
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual string
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

		gotest.Equal(it, "Hello", actual)
		gotest.Equal(it, http.StatusOK, actualStatusCode)
	})
	t.It("Vérification de l'exécution d'une méthode avec paramètre", func(it *gotest.T) {
		bddService := bddAccess.BddService(s.bddProvider)
		sayHelloParameter := func(ctx context.Context, dataAccessId int, parameter JsonParameter) (string, error) {
			return "Hello " + parameter.Value, nil
		}
		request := requestBuilder{}.WithPostMethod().WithParam("Monsieur Vincent").build()

		var actual string
		handlerFunc := getHandler(http.MethodPost, AsParamDataAccessCall(sayHelloParameter, bddService, bddAccess.READ))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

		gotest.Equal(it, "Hello Monsieur Vincent", actual)
		gotest.Equal(it, http.StatusOK, actualStatusCode)
	})
	t.When("Lorsque la méthode provoque une panique", func(w *gotest.T) {
		sayHello := func(ctx context.Context) (string, error) {
			panic("C'est la panique totale là !!! C'est la faute du réchauffement climatique !")
		}
		request := requestBuilder{}.WithGetMethod().WithParam("World").build()
		w.It("la panique est propagée et le serveur est arrêté", func(it *gotest.T) {
			recover := gotest.Panics(it, func() {
				handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
				handlerFunc(httptest.NewRecorder(), request)
			})
			if recover != nil {
				gotest.True(it, srvService.ServerIsStop(), "Une panique est survenue, le serveur doit être en cours d'arrêt")
				// Redémarrer le serveur pour les tests suivants
				srvService.ServerStart()
			}
		})
	})
	t.When("La méthode retourne une erreur non fonctionnelle", func(w *gotest.T) {
		withError := func(ctx context.Context) (string, error) {
			return "", errors.New(ERROR)
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(withError))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

		w.It("la réponse retourne le message avec l'erreur", func(it *gotest.T) {
			gotest.Equal(it, ERROR, actual.GetMessage())
		})
		w.It("la réponse retourne le status http 500", func(it *gotest.T) {
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusInternalServerError, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusInternalServerError, actualStatusCode)
		})
	})
	t.When("La méthode retourne une erreur avec du détail (pqErr)", func(w *gotest.T) {
		withError := func(ctx context.Context) (string, error) {
			return "", &pq.Error{Detail: DETAIL_ERROR, Message: ERROR}
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(withError))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)
		w.It("la réponse retourne le message avec l'erreur détaillée", func(it *gotest.T) {
			gotest.Contains(it, actual.GetMessage(), DETAIL_ERROR)
			gotest.Contains(it, actual.GetMessage(), ERROR)
		})
		w.It("le status de la requête est de type http 500", func(it *gotest.T) {
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusInternalServerError, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusInternalServerError, actualStatusCode)
		})
	})
	t.When("La méthode retourne plusieurs erreurs dont une erreur détaillée", func(w *gotest.T) {
		withError := func(ctx context.Context) (result string, err error) {
			defer func() {
				deferErr := errors.New(ADDITIONAL_ERROR)
				err = utilities.JoinErrors(err, deferErr)
			}()
			return "", &pq.Error{Detail: DETAIL_ERROR, Message: ERROR}
			// NOTE : la variable err de retour est bien affectée par le return puis le defer ajoute l'erreur à cette variable qui est finalement retournée
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(withError))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

		w.It("la réponse doit contenir toutes les erreurs", func(it *gotest.T) {
			gotest.Contains(it, actual.GetMessage(), ADDITIONAL_ERROR)
			gotest.Contains(it, actual.GetMessage(), DETAIL_ERROR)
			gotest.Contains(it, actual.GetMessage(), ERROR)
		})
		w.It("le status de la requête est de type http 500", func(it *gotest.T) {
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusInternalServerError, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusInternalServerError, actualStatusCode)
		})
	})
	t.When("La méthode est de type GET et que la requête est de type POST", func(w *gotest.T) {
		sayHello := func(ctx context.Context) (string, error) {
			return "Hello", nil
		}
		request := requestBuilder{}.WithPostMethod().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)
		w.It("la réponse retourne l'erreur "+METHOD_IS_NOT_ALLOWED, func(it *gotest.T) {
			gotest.Equal(it, METHOD_IS_NOT_ALLOWED, actual.GetMessage())
		})
		w.It("le status de la requête est de type http 405 (not allowed)", func(it *gotest.T) {
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusMethodNotAllowed, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusMethodNotAllowed, actualStatusCode)
		})
	})
	t.When("La méthode est de type POST et que la requête est de type GET", func(w *gotest.T) {
		sayHello := func(ctx context.Context) (string, error) {
			return "Hello", nil
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodPost, AsNoDataAccessCall(sayHello))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)
		w.It("la réponse retourne l'erreur "+METHOD_IS_NOT_ALLOWED, func(it *gotest.T) {
			gotest.Equal(it, METHOD_IS_NOT_ALLOWED, actual.GetMessage())
		})
		w.It("le status de la requête est de type http 405 (not allowed)", func(it *gotest.T) {
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusMethodNotAllowed, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusMethodNotAllowed, actualStatusCode)
		})
	})
	t.When("La méthode utilise des données", func(w *gotest.T) {
		var dataAccess *generic.DataAccessMock
		bddService := bddAccess.BddService(s.bddProvider)
		openInMethod := false
		sayHello := func(ctx context.Context, dataAccessId int) (string, error) {
			dataAccess = bddService.GetAccess(dataAccessId).(*generic.DataAccessMock)
			openInMethod = dataAccess.IsOpen()
			return "Hello", nil
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual string
		handlerFunc := getHandler(http.MethodGet, AsDataAccessCall(sayHello, bddService, bddAccess.READ))
		handlerCaller{}.Call(request, handlerFunc, &actual)

		w.It("l'accès doit être ouvert (ouverture fichier, connection bdd) dans la méthode", func(it *gotest.T) {
			gotest.True(it, openInMethod, "L'accès aux données doit ouvert à l'appel de la méthode")
		})
		w.It("l'accès doit être fermé (fermeture ficher, connection) après l'appel", func(it *gotest.T) {
			gotest.False(it, dataAccess.IsOpen(), "L'accès aux données doit être fermée après l'appel de la méthode")
		})
	})
	t.When("Une erreur survient dans une méthode qui utilise des données", func(w *gotest.T) {
		var dataAccess *generic.DataAccessMock
		bddService := bddAccess.BddService(s.bddProvider)
		openInMethod := false
		sayHello := func(ctx context.Context, dataAccessId int) (string, error) {
			dataAccess = bddService.GetAccess(dataAccessId).(*generic.DataAccessMock)
			openInMethod = dataAccess.IsOpen()
			return "", errors.New(ERROR)
		}
		request := requestBuilder{}.WithGetMethod().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsDataAccessCall(sayHello, bddService, bddAccess.READ))
		handlerCaller{}.Call(request, handlerFunc, &actual)

		w.It("l'accès doit être ouvert (ouverture fichier, connection bdd) dans la méthode", func(it *gotest.T) {
			gotest.True(it, openInMethod, "L'accès aux données doit ouverte à l'appel de la méthode")
		})
		w.It("l'accès doit être fermé (fermeture ficher, connection) après l'appel", func(it *gotest.T) {
			gotest.False(it, dataAccess.IsOpen(), "L'accès aux données doit être fermée après l'appel de la méthode")
		})
		w.It("l'erreur doit être retournée", func(it *gotest.T) {
			gotest.Equal(it, ERROR, actual.GetMessage(), "La méthode renvoie une erreur : cette erreur doit être retournée dans la réponse")
		})
		w.It("les modifications éventuelles des données doivent être annulées", func(it *gotest.T) {
			gotest.True(it, dataAccess.IsCancelled(), "Les modifications des données doivent être annulées car une erreur est survenue")
		})
	})
	t.When("Le serveur http est en cours d'arrêt", func(w *gotest.T) {
		sayHelloCalled := false
		sayHello := func(ctx context.Context) (string, error) {
			sayHelloCalled = true
			return "Hello", nil
		}
		request := requestBuilder{}.WithGetMethod().build()
		srvService.ServerStop()
		// NOTE : on remet le serveur à l'état démarré pour les tests suivants
		defer srvService.ServerStart()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)
		w.It("l'erreur indiquant que le serveur est en cours d'arrêt doit être retournée", func(it *gotest.T) {
			gotest.Equal(it, SERVER_IS_STOPPING, actual.GetMessage())
		})
		w.It("la requête ne doit pas être traitée", func(it *gotest.T) {
			gotest.False(it, sayHelloCalled, "La méthode ne doit pas être appelée car le serveur est en cours d'arrêt")
		})
		w.It("le code http 503 (service Unavailable) doit être retourné", func(it *gotest.T) {
			gotest.Equal(it, http.StatusServiceUnavailable, actualStatusCode, "Le code http doit être StatusServiceUnavailable (503)")
		})
	})
	t.When("L'utilisateur n'est pas correctement authentifié", func(w *gotest.T) {
		sayHelloCalled := false
		sayHello := func(ctx context.Context) (string, error) {
			sayHelloCalled = true
			return "Hello", nil
		}
		request := requestBuilder{}.WithGetMethod().WithInvalidToken().build()

		var actual *mapper.MessageWebResult
		handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)
		w.It("une erreur indiquant que le jeton d'authentification est incorrect doit être retournée", func(it *gotest.T) {
			gotest.Equal(it, TOKEN_INVALID_ERROR, actual.GetMessage())
		})
		w.It("la requête ne doit pas être traitée", func(it *gotest.T) {
			gotest.False(it, sayHelloCalled, "La méthode ne doit pas être appelée car le token d'authentification n'est pas valide")
		})
		w.It("le code http 401 (service Unauthorized) doit être retourné", func(it *gotest.T) {
			gotest.Equal(it, http.StatusUnauthorized, actualStatusCode, "Le code http doit être StatusServiceUnavailable (503)")
		})
	})
}

func (s *HandlerTestSuite) TestGoGetHandler(t *gotest.T) {
	t.When("Appel simultané de plusieurs fois la même requête avec accès à la base de données", func(w *gotest.T) {
		bddService := bddAccess.BddService(s.bddProvider)
		nbCalls := bddAccess.MAX_CONNECTION * 2

		giveBddIdentity := func(ctx context.Context, dataAccessId int) (string, error) {
			log.Printf("Appel method sayHello (%v)", dataAccessId)
			// Ce délai permet que la libération d'une connection ne soit pas trop rapide pour que toutes les connections soient prises au bout de MAX_CONNECTION fois
			time.Sleep(time.Duration(50) * time.Millisecond)
			return strconv.Itoa(dataAccessId), nil
		}
		request := requestBuilder{}.WithGetMethod().build()
		handlerFunc := getHandler(http.MethodGet, AsDataAccessCall(giveBddIdentity, bddService, bddAccess.READ))
		concurrentCaller := concurrentHttpCaller()
		var result string
		for range nbCalls {
			concurrentCaller.call(request, handlerFunc, result)
		}
		concurrentCaller.waitCallsDone()

		w.It("les résultats doivent contenir les identifiants 4 à 0 puis des identifiants compris entre 0 et 4 aléatoirement", func(it *gotest.T) {
			identities := make([]any, bddAccess.MAX_CONNECTION)
			for i := bddAccess.MAX_CONNECTION - 1; i >= 0; i-- {
				identities[i] = strconv.Itoa(i)
			}
			results := concurrentCaller.getResponseResults()
			gotest.Equal(it, len(results), nbCalls)
			gotest.ElementsMatch(it, results[0:5], identities)
			gotest.NotContains(it, results[0:5], identities)
			for _, v := range results[6:] {
				gotest.Contains(it, identities, v)
			}
		})
	})

	// TODO : tester les appels avec paramètres
}
