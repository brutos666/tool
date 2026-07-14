package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"goTool/domain"
	"goTool/interface/http/handler/call"
	"goTool/interface/http/handler/route"
	"goTool/interface/webResult"
	"goTool/utilities"

	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

const DATA_ACCESS_ERROR = "La connection ne devrait pas être déjà ouverte"

type Person struct {
	Name string `json:"name"`
	Age  uint   `json:"age"`
}

func createPerson(name string, age uint) *Person { return &Person{Name: name, Age: age} }

type fakeDataAccessProvider struct{}

func (access *fakeDataAccessProvider) GetInstance() domain.DataAccess { return new(fakeDataBase) }

type fakeDataBase struct {
	connectionOpened bool
	commit           bool
	rollback         bool
}

func (f *fakeDataBase) Start() error {
	// Faire planter le test si l'accès à la base de données est déjà utilisé
	if f.connectionOpened {
		return errors.New(DATA_ACCESS_ERROR)
	}
	f.connectionOpened = true
	return nil
}

func (f *fakeDataBase) Stop() error {
	f.connectionOpened = false
	f.commit = true
	return nil
}

func (f *fakeDataBase) Cancel() error {
	f.rollback = true
	return nil
}

// callHandler : appel d'une fonction type handler puis retourne le contenu du body de la réponse, R est le type de l'objet retourné dans la réponse
func callHandler[R any](path string, method string, callback func(http.ResponseWriter, *http.Request)) (actual *R, response *http.Response) {
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
func TestGetHandler_response_should_be_user_when_function_return_person(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func(ctx context.Context) (*Person, error) {
		return jules, nil
	}
	// When
	functionToLaunch := getHandler(http.MethodGet, call.AsContextCall(getUser), &domain.NilDataAccessProvider{})
	actual, response := callHandler[Person](route.TEST, http.MethodGet, functionToLaunch)
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
func TestGetHandler_response_should_be_error_when_function_return_error(t *testing.T) {
	// Given
	err := errors.New("Utilisateur introuvable")
	getUserWithError := func(ctx context.Context) (*Person, error) {
		return nil, err
	}
	// When
	functionToLaunch := getHandler(http.MethodGet, call.AsContextCall(getUserWithError), &domain.NilDataAccessProvider{})
	actual, response := callHandler[webResult.MessageWebResult](route.TEST, http.MethodGet, functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Equal(t, "Utilisateur introuvable", actual.Error)
	assert.Equal(t, route.TEST, actual.Path)
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
func TestGetHandler_response_should_be_error_when_function_return_pq_error(t *testing.T) {
	// Given
	pqErr := new(pq.Error)
	pqErr.Detail = "Détail sur l'erreur"
	pqErr.Message = "Erreur SQL"

	getUserWithError := func(ctx context.Context) (*Person, error) {
		return nil, pqErr
	}
	// When
	functionToLaunch := getHandler(http.MethodGet, call.AsContextCall(getUserWithError), &domain.NilDataAccessProvider{})
	actual, response := callHandler[webResult.MessageWebResult](route.TEST, http.MethodGet, functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Contains(t, actual.Error, "Détail sur l'erreur")
	assert.Contains(t, actual.Error, "Erreur SQL")
	assert.Equal(t, route.TEST, actual.Path)
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
func TestGetHandler_response_should_be_error_when_function_return_join_error(t *testing.T) {
	// Given

	getUserWithError := func(ctx context.Context) (person *Person, err error) {
		defer func() {
			deferErr := errors.New("Problème lors du defer")
			err = utilities.JoinErrors(err, deferErr)
		}()
		pqErr := new(pq.Error)
		pqErr.Detail = "Détail sur l'erreur"
		pqErr.Message = "Erreur SQL"
		err = pqErr
		return nil, err
	}
	// When
	functionToLaunch := getHandler(http.MethodGet, call.AsContextCall(getUserWithError), &domain.NilDataAccessProvider{})
	actual, response := callHandler[webResult.MessageWebResult](route.TEST, http.MethodGet, functionToLaunch)
	// Then
	assert.Equal(t, http.StatusInternalServerError, response.StatusCode)
	assert.Contains(t, actual.Error, "Détail sur l'erreur")
	assert.Contains(t, actual.Error, "Erreur SQL")
	assert.Contains(t, actual.Error, "Problème lors du defer")
	assert.Equal(t, route.TEST, actual.Path)
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
func TestGetHandler_response_should_be_error_when_request_method_post(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func(ctx context.Context) (*Person, error) {
		return jules, nil
	}

	// When : quand je récupère la fonction à lancer en lui passant la fonction getUser() et que je l'exécute
	functionToLaunch := getHandler(http.MethodGet, call.AsContextCall(getUser), &domain.NilDataAccessProvider{})
	actual, response := callHandler[webResult.MessageWebResult](route.TEST, http.MethodPost, functionToLaunch)

	// Then : il faut que le corps de la réponse contienne l'utilisateur jules
	assert.Equal(t, http.StatusMethodNotAllowed, response.StatusCode)
	assert.Equal(t, METHOD_IS_NOT_ALLOWED, actual.Error)
	assert.Equal(t, route.TEST, actual.Path)
	assert.Equal(t, http.StatusMethodNotAllowed, actual.StatusCode)
}

func TestGetHandler_no_error_when_two_request_at_same_time(t *testing.T) {
	// Given
	jules := createPerson("Jules", 34)
	getUser := func(ctx context.Context, notUsed domain.DataAccess) (*Person, error) {
		time.Sleep(time.Duration(200) * time.Millisecond)
		return jules, nil
	}
	functionToLaunch := getHandler(http.MethodGet, call.AsBasicCall(getUser), &fakeDataAccessProvider{})
	// When
	var err1, err2 string
	var group sync.WaitGroup
	group.Add(2)
	go func() {
		defer group.Done()
		actual, _ := callHandler[webResult.MessageWebResult](route.TEST, http.MethodGet, functionToLaunch)
		err1 = actual.Error
	}()
	go func() {
		defer group.Done()
		actual, _ := callHandler[webResult.MessageWebResult](route.TEST, http.MethodGet, functionToLaunch)
		err2 = actual.Error
	}()
	group.Wait()
	assert.Empty(t, err1)
	assert.Empty(t, err2)
}

// TODO : Tests avec authentification + utiliser le package gotest
