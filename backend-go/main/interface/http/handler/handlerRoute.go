package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"goTool/errorHelper"
	"goTool/interface/http/httpServer"
	"goTool/interface/webResult"
)

type (
	get[R any]     func(context.Context) (R, error)
	post[P, R any] func(context.Context, P) (R, error)
)

type commandRoute[P, R any] struct {
	commandFunc post[P, R]
}

func (route *commandRoute[P, R]) WrapHandler() func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodPost:
			log.Println("Traitement de la requête", request.Method, request.URL.Path, "en cours...")
			processCommandRoute(response, request, route)
			log.Println("Traitement de la requête", request.Method, request.URL.Path, "terminée")
		case http.MethodOptions:
			writeResponse(response, nil, http.StatusOK)
		default:
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
	}
}

type queryRoute[R any] struct {
	queryFunc get[R]
}

func (callbacks *queryRoute[R]) WrapHandler() func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		log.Println("Traitement de la requête", request.Method, request.URL.Path, "en cours...")
		if request.Method == http.MethodGet {
			processQueryRoute(response, request, callbacks)
		} else {
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
		log.Println("Traitement de la requête", request.Method, request.URL.Path, "terminée")
	}
}

func HandleQueryRoute[R any](requestPath string, launchFunc get[R]) {
	if httpServer.ServerIsStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	route := &queryRoute[R]{queryFunc: launchFunc}
	http.HandleFunc(requestPath, route.WrapHandler())
}

func HandleCommandRoute[P, R any](requestPath string, launchFunc post[P, R]) {
	if httpServer.ServerIsStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	route := &commandRoute[P, R]{commandFunc: launchFunc}
	http.HandleFunc(requestPath, route.WrapHandler())
}

func processQueryRoute[R any](response http.ResponseWriter, request *http.Request, route *queryRoute[R]) {
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	values, err := route.queryFunc(ctx)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
	} else {
		webResultValues := webResult.Convert(values)
		sendValues(response, request, &webResultValues)
	}
}

func processCommandRoute[P, R any](response http.ResponseWriter, request *http.Request, route *commandRoute[P, R]) {
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	var parameter P
	webParameter := webResult.GetInstance(parameter)
	err := json.NewDecoder(request.Body).Decode(&webParameter)
	if err != nil {
		sendErrorInResponse(response, request, http.StatusBadRequest, err)
		return
	}
	if validationErr := validate.Struct(webParameter); validationErr != nil {
		sendErrorInResponse(response, request, http.StatusBadRequest, validationErr)
		return
	}
	parameter = webParameter.ConvertToParam().(P)
	values, err := route.commandFunc(ctx, parameter)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
		return
	}
	webResultValues := webResult.Convert(values)
	sendValues(response, request, &webResultValues)
}
