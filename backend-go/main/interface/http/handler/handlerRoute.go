package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"goTool/errorHelper"
	"goTool/interface/http/httpServer"
)

type (
	get[R any]                   func(context.Context) (R, error)
	post[R, P any]               func(context.Context, P) (R, error)
	convertToWebResult[R, W any] func(R) W
)

type commandRoute[R, P, W any] struct {
	commandFunc post[R, P]
	convertFunc convertToWebResult[R, W]
}

func (route *commandRoute[R, P, W]) WrapHandler() func(response http.ResponseWriter, request *http.Request) {
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

type queryRoute[R, W any] struct {
	queryFunc   get[R]
	convertFunc convertToWebResult[R, W]
}

func (callbacks *queryRoute[R, W]) WrapHandler() func(response http.ResponseWriter, request *http.Request) {
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

func HandleQueryRoute[R, W any](requestPath string, launchFunc get[R], convertFunc convertToWebResult[R, W]) {
	if httpServer.ServerIsStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	route := &queryRoute[R, W]{queryFunc: launchFunc, convertFunc: convertFunc}
	http.HandleFunc(requestPath, route.WrapHandler())
}

func HandleCommandRoute[R, P, W any](requestPath string, launchFunc post[R, P], convertFunc convertToWebResult[R, W]) {
	if httpServer.ServerIsStop() {
		HandleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	route := &commandRoute[R, P, W]{commandFunc: launchFunc, convertFunc: convertFunc}
	http.HandleFunc(requestPath, route.WrapHandler())
}

func processQueryRoute[R, W any](response http.ResponseWriter, request *http.Request, route *queryRoute[R, W]) {
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	values, err := route.queryFunc(ctx)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
	} else {
		webResultValues := route.convertFunc(values)
		sendValues(response, request, &webResultValues)
	}
}

func processCommandRoute[R, P, W any](response http.ResponseWriter, request *http.Request, route *commandRoute[R, P, W]) {
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
	values, err := route.commandFunc(ctx, parameter)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
		return
	}
	webResultValues := route.convertFunc(values)
	sendValues(response, request, &webResultValues)
}
