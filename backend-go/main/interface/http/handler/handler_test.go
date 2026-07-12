package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"goTool/domain"
	"goTool/interface/http/handler/call"
	"goTool/interface/webResult"

	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

const fIND_USER_PATH = "/findUser"

type Person struct {
	Name string `json:"name"`
	Age  uint   `json:"age"`
}

func createPerson(name string, age uint) *Person {
	person := new(Person)
	person.Name = name
	person.Age = age
	return person
}

/** Cette fonction effectue l'appel d'un handler en retournant la réponse et le contenu du body
 * OBJ est le type de structure retourné dans le body
 */
func callT[OBJ any](path string, method string, callback func(http.ResponseWriter, *http.Request)) (actual *OBJ, response *http.Response) {
	responseWriter := httptest.NewRecorder()
	request := httptest.NewRequest(method, path, nil)
	callback(responseWriter, request)
	response = responseWriter.Result()
	_ = json.NewDecoder(response.Body).Decode(&actual)
	return
}

/**
 * Le but est de tester la forme de la réponse à une requête API
 *
 * GIVEN : une fonction getUser() qui retourne un utilisateur
 *  WHEN : Lorsque je récupère la fonction à lancer en lui passant la fonction getUser()
 *   AND : j'appelle cette fonction qui doit mettre à jour la réponse
 *  THEN : la réponse doit contenir l'utilisateur retourné par la fonction getUser()
 */
func TestWrapQueryHandler_response_should_be_user_when_function_return_person(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func(ctx context.Context, notUsed domain.DataAccess) (*Person, error) {
		return jules, nil
	}
	// When
	functionToLaunch := wrapHandler(http.MethodGet, call.Get(getUser), nil)
	actual, response := callT[Person](fIND_USER_PATH, "GET", functionToLaunch)
	// Then
	assert.Equal(t, http.StatusOK, response.StatusCode)
	assert.Equal(t, jules, actual)
}

/**
 * Le but est de tester le retour lorsque la fonction utilisée retourne une erreur
 *
 * GIVEN : une fonction getUserWithError() qui retourne une erreur
 *  WHEN : Lorsque je récupère la fonction à lancer en lui passant la fonction getUserWithError()
 *   AND : j'exécute cette fonction qui doit mettre à jour la réponse
 *  THEN : la réponse doit contenir l'erreur
 */
func TestWrapQueryHandler_response_should_be_error_when_function_return_error(t *testing.T) {
	// Given
	err := errors.New("Utilisateur introuvable")
	getUserWithError := func(ctx context.Context, notUsed domain.DataAccess) (*Person, error) {
		return nil, err
	}
	// When
	functionToLaunch := wrapHandler(http.MethodGet, call.Get(getUserWithError), nil)
	actual, response := callT[webResult.MessageWebResult](fIND_USER_PATH, "GET", functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Equal(t, "Utilisateur introuvable", actual.Error)
	assert.Equal(t, fIND_USER_PATH, actual.Path)
	assert.Equal(t, http.StatusInternalServerError, actual.StatusCode)
}

/**
 * Le but est de tester le retour lorsque la fonction utilisée retourne une erreur détaillée de type pq.Error
 *
 * GIVEN : une fonction getUserWithError() qui retourne une erreur sql du package pq
 *  WHEN : Lorsque je récupère la fonction à lancer en lui passant la fonction getUserWithError()
 *   AND : j'exécute cette fonction qui doit mettre à jour la réponse
 *  THEN : la réponse doit contenir l'erreur détaillée
 */
func TestWrapQueryHandler_response_should_be_error_when_function_return_pq_error(t *testing.T) {
	// Given
	pqErr := new(pq.Error)
	pqErr.Detail = "Détail sur l'erreur"
	pqErr.Message = "Erreur SQL"

	getUserWithError := func(ctx context.Context, notUsed domain.DataAccess) (*Person, error) {
		return nil, pqErr
	}
	// When
	functionToLaunch := wrapHandler(http.MethodGet, call.Get(getUserWithError), nil)
	actual, response := callT[webResult.MessageWebResult](fIND_USER_PATH, "GET", functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Contains(t, actual.Error, "Détail sur l'erreur")
	assert.Contains(t, actual.Error, "Erreur SQL")
	assert.Equal(t, fIND_USER_PATH, actual.Path)
	assert.Equal(t, http.StatusInternalServerError, actual.StatusCode)
}

/**
 * Le but est de tester le retour lorsque la fonction utilisée retourne deux erreurs jointes
 *
 * GIVEN : une fonction getUserWithError() qui retourne une erreur puis un defer join l'erreur a une nouvelle erreur
 *  WHEN : Lorsque je récupère la fonction à lancer en lui passant la fonction getUserWithError()
 *   AND : j'exécute cette fonction qui doit mettre à jour la réponse
 *  THEN : la réponse doit contenir les erreurs
 */
func TestWrapQueryHandler_response_should_be_error_when_function_return_join_error(t *testing.T) {
	// Given

	getUserWithError := func(ctx context.Context, notUsed domain.DataAccess) (person *Person, err error) {
		defer func() {
			deferErr := errors.New("Problème lors du defer")
			err = errors.Join(err, deferErr)
		}()
		pqErr := new(pq.Error)
		pqErr.Detail = "Détail sur l'erreur"
		pqErr.Message = "Erreur SQL"
		err = pqErr
		return nil, err
	}
	// When
	functionToLaunch := wrapHandler(http.MethodGet, call.Get(getUserWithError), nil)
	actual, response := callT[webResult.MessageWebResult](fIND_USER_PATH, "GET", functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Contains(t, actual.Error, "Détail sur l'erreur")
	assert.Contains(t, actual.Error, "Erreur SQL")
	assert.Contains(t, actual.Error, "Problème lors du defer")
	assert.Equal(t, fIND_USER_PATH, actual.Path)
	assert.Equal(t, http.StatusInternalServerError, actual.StatusCode)
}

/**
 * Le but est de tester ce qui est renvoyé dans la réponse lorsque la requête API est de type POST au lieu de GET
 *
 * GIVEN : une fonction getUser() qui retourne un utilisateur
 *   AND : une requête de type POST
 *  WHEN : Lorsque je récupère la fonction à lancer en lui passant la fonction getUser()
 *   AND : j'appelle cette fonction pour la requête POST
 *  THEN : la réponse doit contenir une erreur
 */
func TestWrapQueryHandler_response_should_be_error_when_request_method_post(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func(ctx context.Context, notUsed domain.DataAccess) (*Person, error) {
		return jules, nil
	}

	// When : quand je récupère la fonction à lancer en lui passant la fonction getUser() et que je l'exécute
	functionToLaunch := wrapHandler(http.MethodGet, call.Get(getUser), nil)
	actual, response := callT[webResult.MessageWebResult](fIND_USER_PATH, "POST", functionToLaunch)

	// Then : il faut que le corps de la réponse contienne l'utilisateur jules
	assert.Equal(t, http.StatusMethodNotAllowed, response.StatusCode)
	assert.Equal(t, METHOD_IS_NOT_ALLOWED, actual.Error)
	assert.Equal(t, fIND_USER_PATH, actual.Path)
	assert.Equal(t, http.StatusMethodNotAllowed, actual.StatusCode)
}
