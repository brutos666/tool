// Package handler s'occupe de la réception de la requête et de l'envoi de la réponse
package handler

import (
	"context"
	"net/http"
	"time"

	"goTool/errorHelper"
	"goTool/interface/http/httpServer"
)

const (
	NOT_ALLOWED_MESSAGE = "Méthode non autorisée"
	REQUEST_TIMEOUT     = 10 * time.Second
)

func Verify(requestPath string) {
	startApp := func(ctx context.Context) (any, error) {
		message := errorHelper.CreateMessageWebResult(requestPath, http.StatusOK, "Le serveur est bien démarré")
		return message, nil
	}
	http.HandleFunc(requestPath, wrapGetHandler(startApp))
}

func Stop(requestPath string) {
	stopApp := func(ctx context.Context) (any, error) {
		message := errorHelper.CreateMessageWebResult(requestPath, http.StatusOK, "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées")
		httpServer.ServerStop()
		return message, nil
	}
	http.HandleFunc(requestPath, wrapGetHandler(stopApp))
}

func handleError(requestPath string, err error) {
	errorFunc := func(ctx context.Context) (any, error) {
		return nil, err
	}
	http.HandleFunc(requestPath, wrapGetHandler(errorFunc))
}
