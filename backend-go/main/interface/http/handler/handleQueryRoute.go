package handler

import (
	"context"
	"log"
	"net/http"

	"goTool/errorHelper"
	"goTool/interface/http/httpServer"
	"goTool/interface/webResult"
)

type get[R any] func(context.Context) (R, error)

func HandleQueryRoute[R any](requestPath string, launchFunc get[R]) {
	if httpServer.ServerIsStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	http.HandleFunc(requestPath, wrapQueryHandler(launchFunc))
}

func wrapQueryHandler[R any](launchFunc get[R]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		log.Println("Traitement de la requête", request.Method, request.URL.Path, "en cours...")
		if request.Method == http.MethodGet {
			processQueryRoute(response, request, launchFunc)
		} else {
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
		log.Println("Traitement de la requête", request.Method, request.URL.Path, "terminée")
	}
}

func processQueryRoute[R any](response http.ResponseWriter, request *http.Request, launchFunc get[R]) {
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	values, err := launchFunc(ctx)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
	} else {
		webResultValues := webResult.Convert(values)
		sendValues(response, request, &webResultValues)
	}
}
