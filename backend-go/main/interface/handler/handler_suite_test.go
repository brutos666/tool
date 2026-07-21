package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"

	"goTool/domain"
	"goTool/domain/domainMessage"
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

type dataAccessProviderMock struct{}

func (access *dataAccessProviderMock) GetInstance() domain.DataAccess { return new(dataBaseMock) }

type dataBaseMock struct {
	open   bool
	cancel bool
}

func (f *dataBaseMock) isOpen() bool      { return f.open }
func (f *dataBaseMock) isCancelled() bool { return f.cancel }
func (f *dataBaseMock) Open() error {
	f.open = true
	return nil
}

func (f *dataBaseMock) Close() error {
	f.open = false
	return nil
}

func (f *dataBaseMock) Cancel() error {
	f.cancel = true
	return nil
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

type HandlerTestSuite struct{}

// BeforeEach : pour chaque fonction TestXxx(t *gotest.T), PAS pour chaque t.It
func (s *HandlerTestSuite) BeforeEach(t *gotest.T) {
	InitAuthService(authServiceMock{})
	InitServerService(&httpServiceMock{})
	srvService.ServerStart()
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
		sayHelloParameter := func(ctx context.Context, dataAccess domain.DataAccess, parameter JsonParameter) (string, error) {
			return "Hello " + parameter.Value, nil
		}
		request := requestBuilder{}.WithPostMethod().WithParam("Monsieur Vincent").build()

		var actual string
		handlerFunc := getHandler(http.MethodPost, AsParamDataAccessCall(sayHelloParameter, &dataAccessProviderMock{}))
		actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

		gotest.Equal(it, "Hello Monsieur Vincent", actual)
		gotest.Equal(it, http.StatusOK, actualStatusCode)
	})
	t.When("Si la méthode a besoin d'un accès à des données mais qu'il n'est pas fourni", func(w *gotest.T) {
		w.It("Alors une panique survient et le serveur est arrêté", func(it *gotest.T) {
			sayHello := func(ctx context.Context, dataAccess domain.DataAccess) (string, error) {
				return "Hello", nil
			}
			request := requestBuilder{}.WithGetMethod().WithParam("World").build()

			recover := gotest.Panics(it, func() {
				noDataAccess := domain.NilDataAccessProvider{}
				handlerFunc := getHandler(http.MethodGet, AsDataAccessCall(sayHello, &noDataAccess))
				handlerFunc(httptest.NewRecorder(), request)
			})
			if recover != nil {
				gotest.True(it, srvService.ServerIsStop(), "Une panique est survenue, le serveur doit être en cours d'arrêt")
				// Redémarrer le serveur pour les tests suivants
				srvService.ServerStart()
			}
		})
	})
	t.When("Si la méthode retourne une erreur non fonctionnelle", func(w *gotest.T) {
		w.It("Alors la réponse retourne une message avec l'erreur, le status de la requête est de type http 500", func(it *gotest.T) {
			withError := func(ctx context.Context) (string, error) {
				return "", errors.New(ERROR)
			}
			request := requestBuilder{}.WithGetMethod().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(withError))
			actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Equal(it, ERROR, actual.GetMessage())
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusInternalServerError, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusInternalServerError, actualStatusCode)
		})
	})
	t.When("Si la méthode retourne une erreur avec du détail (pqErr)", func(w *gotest.T) {
		w.It("Alors la réponse retourne une message avec l'erreur détaillée, le status de la requête est de type http 500", func(it *gotest.T) {
			withError := func(ctx context.Context) (string, error) {
				return "", &pq.Error{Detail: DETAIL_ERROR, Message: ERROR}
			}
			request := requestBuilder{}.WithGetMethod().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(withError))
			actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Contains(it, actual.GetMessage(), DETAIL_ERROR)
			gotest.Contains(it, actual.GetMessage(), ERROR)
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusInternalServerError, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusInternalServerError, actualStatusCode)
		})
	})
	t.When("Si la méthode retourne plusieurs erreurs dont une erreur détaillée", func(w *gotest.T) {
		w.It("Alors la réponse doit contenir toutes les erreurs, le status de la requête est de type http 500", func(it *gotest.T) {
			withError := func(ctx context.Context) (result string, err error) {
				defer func() {
					deferErr := errors.New(ADDITIONAL_ERROR)
					err = utilities.JoinErrors(err, deferErr)
				}()
				return "", &pq.Error{Detail: DETAIL_ERROR, Message: ERROR}
				// NOTE : la variable err de retour est bine affectée par le return puis le defer ajoute l'erreur à cette variable qui est finalement retournée
			}
			request := requestBuilder{}.WithGetMethod().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(withError))
			actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Contains(it, actual.GetMessage(), ADDITIONAL_ERROR)
			gotest.Contains(it, actual.GetMessage(), DETAIL_ERROR)
			gotest.Contains(it, actual.GetMessage(), ERROR)
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusInternalServerError, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusInternalServerError, actualStatusCode)
		})
	})
	t.When("Si la méthode est de type GET et que la requête est de type POST", func(w *gotest.T) {
		w.It("Alors la réponse retourne une message avec l'erreur, le status de la requête est de type http 405", func(it *gotest.T) {
			sayHello := func(ctx context.Context) (string, error) {
				return "Hello", nil
			}
			request := requestBuilder{}.WithPostMethod().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
			actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Equal(it, METHOD_IS_NOT_ALLOWED, actual.GetMessage())
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusMethodNotAllowed, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusMethodNotAllowed, actualStatusCode)
		})
	})
	t.When("Si la méthode est de type POST et que la requête est de type GET", func(w *gotest.T) {
		w.It("Alors la réponse retourne une message avec l'erreur, le status de la requête est de type http 405", func(it *gotest.T) {
			sayHello := func(ctx context.Context) (string, error) {
				return "Hello", nil
			}
			request := requestBuilder{}.WithGetMethod().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodPost, AsNoDataAccessCall(sayHello))
			actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Equal(it, METHOD_IS_NOT_ALLOWED, actual.GetMessage())
			gotest.Equal(it, REQUEST_PATH, actual.GetPath())
			gotest.Equal(it, http.StatusMethodNotAllowed, actual.GetHttpStatusCode())
			gotest.Equal(it, http.StatusMethodNotAllowed, actualStatusCode)
		})
	})
	t.When("Si la méthode utilise des données", func(w *gotest.T) {
		w.It("Alors l'accès doit être démarré (ouverture fichier, connection bdd) avant l'appel et être arrêté après (fermeture ficher, connection)", func(it *gotest.T) {
			var dataAccessMock *dataBaseMock
			sayHello := func(ctx context.Context, dataAccess domain.DataAccess) (string, error) {
				dataAccessMock = dataAccess.(*dataBaseMock)
				gotest.True(it, dataAccessMock.isOpen(), "L'accès aux données doit ouvert à l'appel de la méthode")
				return "Hello", nil
			}
			request := requestBuilder{}.WithGetMethod().build()

			var actual string
			handlerFunc := getHandler(http.MethodGet, AsDataAccessCall(sayHello, &dataAccessProviderMock{}))
			handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.False(it, dataAccessMock.isOpen(), "L'accès aux données doit être fermée après l'appel de la méthode")
		})
	})
	t.When("Si une erreur survient dans une méthode qui utilise des données", func(w *gotest.T) {
		w.It("Alors les modifications éventuelles des données doivent être annulées", func(it *gotest.T) {
			var dataAccessMock *dataBaseMock
			sayHello := func(ctx context.Context, dataAccess domain.DataAccess) (string, error) {
				dataAccessMock = dataAccess.(*dataBaseMock)
				gotest.True(it, dataAccessMock.isOpen(), "L'accès aux données doit ouverte à l'appel de la méthode")
				return "", errors.New(ERROR)
			}
			request := requestBuilder{}.WithGetMethod().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodGet, AsDataAccessCall(sayHello, &dataAccessProviderMock{}))
			handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Equal(it, ERROR, actual.GetMessage(), "La méthode renvoie une erreur : cette erreur doit être retournée dans la réponse")
			gotest.True(it, dataAccessMock.isCancelled(), "Les modifications des données doivent être annulées car une erreur est survenue")
			gotest.False(it, dataAccessMock.isOpen(), "L'accès aux données doit être fermée après l'appel de la méthode")
		})
	})
	t.When("Si le serveur http est en cours d'arrêt", func(w *gotest.T) {
		w.It("Alors une erreur survient avec le code http 503 (service Unavailable) et la requête ne doit pas être traitée", func(it *gotest.T) {
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

			gotest.Equal(it, SERVER_IS_STOPPING, actual.GetMessage())
			gotest.False(it, sayHelloCalled, "La méthode ne doit pas être appelée car le serveur est en cours d'arrêt")
			gotest.Equal(it, http.StatusServiceUnavailable, actualStatusCode, "Le code http doit être StatusServiceUnavailable (503)")
		})
	})
	t.When("Si l'utilisateur n'est pas correctement authentifié", func(w *gotest.T) {
		w.It("Alors une erreur survient avec le code http 401 (service Unauthorized) et la requête ne doit pas être traitée", func(it *gotest.T) {
			sayHelloCalled := false
			sayHello := func(ctx context.Context) (string, error) {
				sayHelloCalled = true
				return "Hello", nil
			}
			request := requestBuilder{}.WithGetMethod().WithInvalidToken().build()

			var actual *mapper.MessageWebResult
			handlerFunc := getHandler(http.MethodGet, AsNoDataAccessCall(sayHello))
			actualStatusCode := handlerCaller{}.Call(request, handlerFunc, &actual)

			gotest.Equal(it, TOKEN_INVALID_ERROR, actual.GetMessage())
			gotest.False(it, sayHelloCalled, "La méthode ne doit pas être appelée car le token d'authentification n'est pas valide")
			gotest.Equal(it, http.StatusUnauthorized, actualStatusCode, "Le code http doit être StatusServiceUnavailable (503)")
		})
	})

	// TODO : tester les appels avec paramètres
	// TODO : tester l'arrêt du serveur quand il y a une panic
}
