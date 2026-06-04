package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

const NOT_ALLOWED_MESSAGE = "Méthode non autorisée"

// Type de fonction permettant de récupérer n'importe quel type d'objet
type getFunction[R any] func() (R, error)
type handleFunction[response http.ResponseWriter, request *http.Request] func(response, request)

func Stop(requestPath string) {
	stopApp := func () (any, error) {
		message := createMessageWebResult("/stop", http.StatusOK, "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées")
		return message, nil
	}
	functionToLaunch := func(response http.ResponseWriter, request *http.Request) {
		process(response, request, stopApp)
		ServerStop()
	}

	http.HandleFunc(requestPath, functionToLaunch)
}

func Handle[R any](requestPath string, callback getFunction[R]) {
	if (webServer.isStop()) {
		errorFunc := func() (any, error) {
			return nil, errors.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée")
		}
		http.HandleFunc(requestPath, getFunctionToLaunch(errorFunc))
		return
	}
	http.HandleFunc(requestPath, getFunctionToLaunch(callback))
}

func getFunctionToLaunch[R any](callback getFunction[R]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		process(response, request, callback)
	}
}

func process[R any](response http.ResponseWriter, request *http.Request, callback getFunction[R]) {
	defer func() {
		panicMessage := recover()
		if (panicMessage != nil) {
			log.Println(panicMessage)
			ServerStop()
		}
	}()

	log.Println("Traitement de la requête", request.URL.Path, "en cours...")
	values, err := callback()
	if (err != nil) {
		sendErrorInResponse(response, request, http.StatusInternalServerError, err)
	} else {
		sendValues(response, request, &values)
	}
	log.Println("Traitement de la requête", request.URL.Path, "terminée")
}

func sendValues(response http.ResponseWriter, request *http.Request, values any) {
	switch request.Method {
		case http.MethodGet:
			// On renvoie la réponse au format JSON
			jsonData, err := json.Marshal(values)
			if (err != nil) {
				sendErrorInResponse(response, request, http.StatusInternalServerError, err)
			}
			writeResponse(response, jsonData, http.StatusOK)
		default:
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errors.New(NOT_ALLOWED_MESSAGE))
	}
}

func sendErrorInResponse(response http.ResponseWriter, request *http.Request, statusCode int, err error) {
	errorWebResult := createErrorWebResult(request.URL.Path, statusCode, err.Error())
	jsonData, responseErr := json.Marshal(errorWebResult)
	if (responseErr != nil) {
		panic("Impossible de renvoyer l'erreur '" + err.Error() + "' dans la réponse à la requête '" + request.URL.RequestURI() + "'")
	}
	writeResponse(response, jsonData, statusCode)
}

func writeResponse(response http.ResponseWriter, jsonData []byte, statusCode int) {
	response.Header().Set("Access-Control-Allow-Origin", "*")
	response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)
	response.Write(jsonData)
}

