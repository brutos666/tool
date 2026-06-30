package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"goTool/errorHelper"

	"github.com/go-playground/validator/v10"
)

const (
	NOT_ALLOWED_MESSAGE = "Méthode non autorisée"
	REQUEST_TIMEOUT     = 10 * time.Second
)

var validate = validator.New()

// Type de fonction permettant de récupérer n'importe quel type d'objet
type (
	getFunction[R any]                                                  func(context.Context) (R, error)
	postFunction[R, P any]                                              func(context.Context, P) (R, error)
	handleFunction[response http.ResponseWriter, request *http.Request] func(response, request)
)

func Stop(requestPath string) {
	stopApp := func(ctx context.Context) (any, error) {
		message := errorHelper.CreateMessageWebResult("/stop", http.StatusOK, "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées")
		return message, nil
	}
	functionToLaunch := func(response http.ResponseWriter, request *http.Request) {
		process(response, request, stopApp)
		ServerStop()
	}
	http.HandleFunc(requestPath, functionToLaunch)
}

func HandleError(requestPath string, err error) {
	errorFunc := func(ctx context.Context) (any, error) {
		return nil, err
	}
	http.HandleFunc(requestPath, getFunctionToLaunch(errorFunc))
}

func HandleGet[R any](requestPath string, callback getFunction[R]) {
	if webServer.isStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	http.HandleFunc(requestPath, getFunctionToLaunch(callback))
}

func HandlePost[R, P any](requestPath string, callback postFunction[R, P]) {
	if webServer.isStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	http.HandleFunc(requestPath, getPostFunctionToLaunch(callback))
}

func getFunctionToLaunch[R any](callback getFunction[R]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		log.Println("Traitement de la requête", request.Method, request.URL.Path, "en cours...")
		if request.Method == http.MethodGet {
			process(response, request, callback)
		} else {
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
		log.Println("Traitement de la requête", request.Method, request.URL.Path, "terminée")
	}
}

func getPostFunctionToLaunch[R, P any](callback postFunction[R, P]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodPost:
			log.Println("Traitement de la requête", request.Method, request.URL.Path, "en cours...")
			processPost(response, request, callback)
			log.Println("Traitement de la requête", request.Method, request.URL.Path, "terminée")
		case http.MethodOptions:
			writeResponse(response, nil, http.StatusOK)
		default:
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
	}
}

func stopServerIfPanic() {
	panicMessage := recover()
	if panicMessage != nil {
		log.Println(panicMessage)
		ServerStop()
	}
}

func process[R any](response http.ResponseWriter, request *http.Request, callback getFunction[R]) {
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	values, err := callback(ctx)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
	} else {
		sendValues(response, request, &values)
	}
}

func processPost[R, P any](response http.ResponseWriter, request *http.Request, callback postFunction[R, P]) {
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	var parameter P
	err := json.NewDecoder(request.Body).Decode(&parameter)
	if err != nil {
		sendErrorInResponse(response, request, http.StatusBadRequest, err)
		return
	}
	if validationErr := validate.Struct(parameter); validationErr != nil {
		sendErrorInResponse(response, request, http.StatusBadRequest, validationErr)
		return
	}
	values, err := callback(ctx, parameter)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
		return
	}

	sendValues(response, request, &values)
}

func sendValues(response http.ResponseWriter, request *http.Request, values any) {
	// On renvoie la réponse au format JSON
	jsonData, err := json.Marshal(values)
	if err != nil {
		sendErrorInResponse(response, request, http.StatusInternalServerError, err)
	}
	writeResponse(response, jsonData, http.StatusOK)
}

func sendErrorInResponse(response http.ResponseWriter, request *http.Request, statusCode int, err error) {
	message := errorHelper.GetDetailError(err)
	errorWebResult := errorHelper.CreateMessageWebResult(request.URL.Path, statusCode, message)
	jsonData, responseErr := json.Marshal(errorWebResult)
	if responseErr != nil {
		panic("Impossible de renvoyer l'erreur '" + message + "' dans la réponse à la requête '" + request.URL.RequestURI() + "'")
	}
	writeResponse(response, jsonData, statusCode)
	log.Println("Erreur requête", request.Method, request.URL.Path, ":", message)
}

func writeResponse(response http.ResponseWriter, jsonData []byte, statusCode int) {
	response.Header().Set("Access-Control-Allow-Origin", "*")
	response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)
	response.Write(jsonData)
}
