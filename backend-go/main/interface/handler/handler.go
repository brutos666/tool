// Package handler s'occupe de la réception de la requête et de l'envoi de la réponse
package handler

import (
	"context"
	"net/http"

	"goTool/domain"
	"goTool/interface/handler/authentication"
	"goTool/interface/handler/responseMessage"
)

const (
	SERVER_STARTED       = "Le serveur est bien démarré"
	SERVER_ABOUT_TO_STOP = "Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées"
	SERVER_IS_STOPPING   = "Serveur en cours d'arrêt : la requête ne peut pas être exécutée"
)

var srvService ServerService

type ServerService interface {
	ServerStart()
	StopServerOnSignal()
	ServerStop()
	ServerIsStop() bool
}
type AuthentificationService interface {
	Verify(authHeader string, tokenCheck domain.TokensCheck) (*domain.ConnectedUser, error)
}

func InitServerService(service ServerService) {
	srvService = service
	srvService.ServerStart()
	go srvService.StopServerOnSignal()
}

func InitAuthService(service AuthentificationService) {
	authentication.InitAuthService(service)
}

func Verify(requestPath string) {
	startApp := func(ctx context.Context) (*responseMessage.Message, error) {
		message := responseMessage.NewMessage(SERVER_STARTED, http.StatusOK)
		return message, nil
	}
	http.HandleFunc(requestPath, getHandler(http.MethodGet, AsContextCall(startApp), &domain.NilDataAccessProvider{}))
}

func Stop(requestPath string) {
	stopApp := func(ctx context.Context) (*responseMessage.Message, error) {
		message := responseMessage.NewMessage(SERVER_ABOUT_TO_STOP, http.StatusOK)
		srvService.ServerStop()
		return message, nil
	}
	http.HandleFunc(requestPath, getHandler(http.MethodGet, AsContextCall(stopApp), &domain.NilDataAccessProvider{}))
}

func stopServerIfPanic() {
	panicMessage := recover()
	if panicMessage != nil {
		srvService.ServerStop()
		panic(panicMessage)
	}
}

func checkServerRunning(requestPath string) error {
	if srvService.ServerIsStop() {
		return responseMessage.NewError(SERVER_IS_STOPPING, requestPath, http.StatusServiceUnavailable)
	}
	return nil
}
