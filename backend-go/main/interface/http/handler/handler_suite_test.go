package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"

	"goTool/domain"
	"goTool/interface/http/handler/authentication"
	"goTool/interface/http/handler/call"
	"goTool/interface/webResult"
	"goTool/utilities"

	"github.com/lib/pq"
	"github.com/mvrahden/go-test/pkg/gotest"
)

const (
	USER_ID          = "01234567"
	USER_EMAIL       = "alice@example.com"
	USER_ROLE        = "ADMIN"
	VALID_TOKEN      = "token valide"
	INVALID_TOKEN    = "token invalide"
	REQUEST_PATH     = "/api/hello"
	DETAIL_ERROR     = "Erreur détaillée"
	ERROR            = "Erreur à l'exécution"
	ADDITIONAL_ERROR = "Erreur supplémentaire"
)

type authServiceMock struct{}

func (service authServiceMock) Verify(token string, tokenCheck domain.TokensCheck) (*domain.ConnectedUser, error) {
	if token == VALID_TOKEN {
		connectedUser := domain.CreateConnectedUser(USER_ID, USER_EMAIL, USER_ROLE)
		return connectedUser, nil
	}
	return nil, errors.New("Pas authentifié")
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

type handlerCaller struct {
	response *http.Response
}

func (s handlerCaller) Call(method, path, token string, handler func(http.ResponseWriter, *http.Request)) handlerCaller {
	responseWriter := httptest.NewRecorder()
	request := httptest.NewRequest(method, path, nil)
	request.Header.Set(authentication.AUTH_HEADER, authentication.AUTH_TOKEN_PREFIX+token)

	handler(responseWriter, request)

	s.response = responseWriter.Result()
	return s
}

func (s handlerCaller) ReturnResults(result any) (statusCode int) {
	_ = json.NewDecoder(s.response.Body).Decode(result)
	return s.response.StatusCode
}

type HandlerTestSuite struct{}

func (s *HandlerTestSuite) BeforeEach(t *gotest.T) {
	authentication.InitAuthService(authServiceMock{})
}

func (s *HandlerTestSuite) TestGetHandler(t *gotest.T) {
	t.It("Vérification de l'exécution pour une méthode sans paramètre : affiche le résultat Hello", func(it *gotest.T) {
		sayHello := func(ctx context.Context) (string, error) {
			return "Hello", nil
		}
		var actual string
		handler := getHandler(http.MethodGet, call.AsContextCall(sayHello), &domain.NilDataAccessProvider{})
		actualStatusCode := handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

		gotest.Equal(it, "Hello", actual)
		gotest.Equal(it, http.StatusOK, actualStatusCode)
	})
	t.When("Si la méthode retourne une erreur non fonctionnelle", func(w *gotest.T) {
		w.It("Alors la réponse retourne une message avec l'erreur, le status de la requête est de type http 500", func(it *gotest.T) {
			withError := func(ctx context.Context) (string, error) {
				return "", errors.New(ERROR)
			}
			var actual *webResult.MessageWebResult
			handler := getHandler(http.MethodGet, call.AsContextCall(withError), &domain.NilDataAccessProvider{})
			actualStatusCode := handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

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
			var actual *webResult.MessageWebResult
			handler := getHandler(http.MethodGet, call.AsContextCall(withError), &domain.NilDataAccessProvider{})
			actualStatusCode := handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

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
				// NOTE : la variable err de retour est bine affectée par le return puis le defer ajoute l'erreur à cette variable qui
				// est finalement retournée
			}
			var actual *webResult.MessageWebResult
			handler := getHandler(http.MethodGet, call.AsContextCall(withError), &domain.NilDataAccessProvider{})
			actualStatusCode := handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

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
			var actual *webResult.MessageWebResult
			handler := getHandler(http.MethodGet, call.AsContextCall(sayHello), &domain.NilDataAccessProvider{})
			actualStatusCode := handlerCaller{}.Call(http.MethodPost, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

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
			var actual *webResult.MessageWebResult
			handler := getHandler(http.MethodPost, call.AsContextCall(sayHello), &domain.NilDataAccessProvider{})
			actualStatusCode := handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

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
			var actual string
			handler := getHandler(http.MethodGet, call.AsBasicCall(sayHello), &dataAccessProviderMock{})
			handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

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
			var actual *webResult.MessageWebResult
			handler := getHandler(http.MethodGet, call.AsBasicCall(sayHello), &dataAccessProviderMock{})
			handlerCaller{}.Call(http.MethodGet, REQUEST_PATH, VALID_TOKEN, handler).ReturnResults(&actual)

			gotest.Equal(it, ERROR, actual.GetMessage(), "La méthode renvoie une erreur : cette erreur doit être retournée dans la réponse")
			gotest.True(it, dataAccessMock.isCancelled(), "Les modifications des données doivent être annulées car une erreur est survenue")
			gotest.False(it, dataAccessMock.isOpen(), "L'accès aux données doit être fermée après l'appel de la méthode")
		})
	})
	// TODO : tester les authentifications
	// TODO : tester les appels avec paramètres
	// TODO : tester l'arrêt du serveur quand il y a une panic
}
