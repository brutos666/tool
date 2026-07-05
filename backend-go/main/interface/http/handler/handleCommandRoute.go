package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"goTool/errorHelper"
	"goTool/interface/http/httpServer"
	"goTool/interface/webResult"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

type post[P, R any] func(context.Context, P) (R, error)

func HandleCommandRoute[P, R any](requestPath string, launchFunc post[P, R]) {
	if httpServer.ServerIsStop() {
		handleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	http.HandleFunc(requestPath, wrapCommandHandler(launchFunc))
}

func wrapCommandHandler[P, R any](launchFunc post[P, R]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodPost:
			log.Println("Traitement de la requête", request.Method, request.URL.Path, "en cours...")
			processCommandRoute(response, request, launchFunc)
			log.Println("Traitement de la requête", request.Method, request.URL.Path, "terminée")
		case http.MethodOptions:
			writeResponse(response, nil, http.StatusOK)
		default:
			sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
	}
}

func processCommandRoute[P, R any](response http.ResponseWriter, request *http.Request, launchFunc post[P, R]) {
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
	parameter = webResult.Convert(webParameter).(P)
	values, err := launchFunc(ctx, parameter)
	if err != nil {
		sendErrorInResponse(response, request, errorHelper.GetHttpStatusError(err), err)
		return
	}
	webResultValues := webResult.Convert(values)
	sendValues(response, request, &webResultValues)
}
