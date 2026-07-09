// Package handler s'occupe de la réception de la requête et de l'envoi de la réponse
package handler

import (
	"context"
	"net/http"
	"time"

	"goTool/interface/http/handler/call"
	"goTool/interface/http/httpMessage"
	"goTool/interface/http/httpServer"
)

const (
	METHOD_IS_NOT_ALLOWED = "Méthode non autorisée"
	REQUEST_TIMEOUT       = 10 * time.Second
)

const (
	SERVER_STARTED       = "Le serveur est bien démarré"
	SERVER_ABOUT_TO_STOP = "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées"
)

func Verify(requestPath string) {
	startApp := func(ctx context.Context) (*httpMessage.Message, error) {
		message := httpMessage.NewMessage(SERVER_STARTED, http.StatusOK)
		return message, nil
	}
	http.HandleFunc(requestPath, wrapHandler(http.MethodGet, call.Get(startApp)))
}

func Stop(requestPath string) {
	stopApp := func(ctx context.Context) (*httpMessage.Message, error) {
		message := httpMessage.NewMessage(SERVER_ABOUT_TO_STOP, http.StatusOK)
		httpServer.ServerStop()
		return message, nil
	}
	http.HandleFunc(requestPath, wrapHandler(http.MethodGet, call.Get(stopApp)))
}
