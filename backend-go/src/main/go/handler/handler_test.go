package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

const fIND_USER_PATH="/findUser"

type Person struct {
	Name string `json:"name"`
	Age uint `json:"age"`
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
func call[OBJ any](path string, method string, callback func(http.ResponseWriter, *http.Request)) (actual *OBJ, response *http.Response) {
	responseWriter := httptest.NewRecorder()
	request := httptest.NewRequest(method, path, nil)
	callback(responseWriter, request)
	response = responseWriter.Result()
	json.NewDecoder(response.Body).Decode(&actual);
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
func TestFunctionToLaunch_response_should_be_user_when_function_return_person(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func() (*Person, error) {
		return jules, nil
	}
	// When
	functionToLaunch := getFunctionToLaunch(getUser)
	actual, response := call[Person](fIND_USER_PATH, "GET", functionToLaunch)
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
func TestFunctionToLaunch_response_should_be_error_when_function_return_error(t *testing.T) {
	// Given
	err := errors.New("Utilisateur introuvable")
	getUserWithError := func() (*Person, error) {
		return nil, err
	}
	// When
	functionToLaunch := getFunctionToLaunch(getUserWithError)
	actual, response := call[errorWebResult](fIND_USER_PATH, "GET", functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Equal(t, "Utilisateur introuvable", actual.Error)
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
func TestFunctionToLaunch_response_should_be_error_when_request_method_post(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func() (*Person, error) {
		return jules, nil
	}
	
	// When : quand je récupère la fonction à lancer en lui passant la fonction getUser() et que je l'exécute
	functionToLaunch := getFunctionToLaunch(getUser)
	actual, response := call[errorWebResult](fIND_USER_PATH, "POST", functionToLaunch)

	// Then : il faut que le corps de la réponse contienne l'utilisateur jules
	assert.Equal(t, http.StatusMethodNotAllowed, response.StatusCode)
	assert.Equal(t, NOT_ALLOWED_MESSAGE, actual.Error)
	assert.Equal(t, fIND_USER_PATH, actual.Path)
	assert.Equal(t, http.StatusMethodNotAllowed, actual.StatusCode)
}