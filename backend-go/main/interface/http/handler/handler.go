// Package handler s'occupe de la réception de la requête et de l'envoi de la réponse
package handler

import (
	"context"
	"net/http"
	"time"

	"goTool/domain"
	"goTool/interface/http/handler/call"
	"goTool/interface/http/httpMessage"
)

const (
	METHOD_IS_NOT_ALLOWED = "Méthode non autorisée"
	REQUEST_TIMEOUT       = 100 * time.Second
)

const (
	SERVER_STARTED       = "Le serveur est bien démarré"
	SERVER_ABOUT_TO_STOP = "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées"
)

var srvService ServerService

type ServerService interface {
	ServerStart()
	StopServerOnSignal()
	ServerStop()
	ServerIsStop() bool
}

func InitServerService(service ServerService) {
	srvService = service
	srvService.ServerStart()
	go srvService.StopServerOnSignal()
}

func Verify(requestPath string) {
	startApp := func(ctx context.Context) (*httpMessage.Message, error) {
		message := httpMessage.NewMessage(SERVER_STARTED, http.StatusOK)
		return message, nil
	}
	http.HandleFunc(requestPath, getHandler(http.MethodGet, call.AsContextCall(startApp), &domain.NilDataAccessProvider{}))
}

func Stop(requestPath string) {
	stopApp := func(ctx context.Context) (*httpMessage.Message, error) {
		message := httpMessage.NewMessage(SERVER_ABOUT_TO_STOP, http.StatusOK)
		srvService.ServerStop()
		return message, nil
	}
	http.HandleFunc(requestPath, getHandler(http.MethodGet, call.AsContextCall(stopApp), &domain.NilDataAccessProvider{}))
}
