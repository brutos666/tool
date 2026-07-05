// Package handler s'occupe de la réception de la requête et de l'envoi de la réponse
package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"goTool/errorHelper"
	"goTool/interface/http/httpServer"
)

const (
	NOT_ALLOWED_MESSAGE = "Méthode non autorisée"
	REQUEST_TIMEOUT     = 10 * time.Second
)

func Test(requestPath string) {
	startApp := func(ctx context.Context) (any, error) {
		message := errorHelper.CreateMessageWebResult(requestPath, http.StatusOK, "Le serveur est bien démarré")
		return message, nil
	}
	functionToLaunch := func(response http.ResponseWriter, request *http.Request) {
		processQueryRoute(response, request, startApp)
	}
	http.HandleFunc(requestPath, functionToLaunch)
}

func Stop(requestPath string) {
	stopApp := func(ctx context.Context) (any, error) {
		message := errorHelper.CreateMessageWebResult(requestPath, http.StatusOK, "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées")
		return message, nil
	}
	functionToLaunch := func(response http.ResponseWriter, request *http.Request) {
		processQueryRoute(response, request, stopApp)
		httpServer.ServerStop()
	}
	http.HandleFunc(requestPath, functionToLaunch)
}

func handleError(requestPath string, err error) {
	errorFunc := func(ctx context.Context) (any, error) {
		return nil, err
	}
	http.HandleFunc(requestPath, wrapQueryHandler(errorFunc))
}

func stopServerIfPanic() {
	panicMessage := recover()
	if panicMessage != nil {
		log.Println(panicMessage)
		httpServer.ServerStop()
	}
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
