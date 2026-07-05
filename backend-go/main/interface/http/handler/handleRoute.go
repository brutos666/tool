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

type (
	wrapCall[R any]         func(context.Context, *http.Request) (R, error)
	callWithParam[P, R any] func(context.Context, P) (R, error)
	returnOnlyCall[R any]   func(context.Context) (R, error)
)

var validate = validator.New()

func HandlePostRoute[P, R any](requestPath string, callback callWithParam[P, R]) {
	if httpServer.ServerIsStop() {
		handleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	http.HandleFunc(requestPath, wrapPostHandler[P](callback))
}

func HandleGetRoute[R any](requestPath string, callback returnOnlyCall[R]) {
	if httpServer.ServerIsStop() {
		handleError(requestPath, errorHelper.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée"))
		return
	}
	http.HandleFunc(requestPath, wrapGetHandler(callback))
}

func wrapPostHandler[P, R any](callback callWithParam[P, R]) func(response http.ResponseWriter, request *http.Request) {
	toCall := wrapCallbackWithParam(callback)

	return func(response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		log.Println("Traitement de la requête", requestPath, "en cours...")

		switch request.Method {
		case http.MethodPost:
			callSendResponse(response, request, toCall)
		case http.MethodOptions:
			writeResponse(response, requestPath, nil, http.StatusOK)
		default:
			sendErrorInResponse(response, requestPath, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
		log.Println("Traitement de la requête", requestPath, "terminée")
	}
}

func wrapGetHandler[R any](callback returnOnlyCall[R]) func(response http.ResponseWriter, request *http.Request) {
	toCall := wrapCallback(callback)

	return func(response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		log.Println("Traitement de la requête", requestPath, "en cours...")

		switch request.Method {
		case http.MethodGet:
			callSendResponse(response, request, toCall)
		default:
			sendErrorInResponse(response, requestPath, http.StatusMethodNotAllowed, errorHelper.New(NOT_ALLOWED_MESSAGE))
		}
		log.Println("Traitement de la requête", requestPath, "terminée")
	}
}

func wrapCallback[R any](callback returnOnlyCall[R]) wrapCall[R] {
	return func(ctx context.Context, request *http.Request) (R, error) {
		return callback(ctx)
	}
}

// wrapCallbackWithParam ajoute le passage du paramètre de la requête s'il est attendu en entrée de la fonction callback
func wrapCallbackWithParam[P, R any](callback callWithParam[P, R]) wrapCall[R] {
	return func(ctx context.Context, request *http.Request) (R, error) {
		parameter, err := readRequestParameter[P](request)
		if err != nil {
			return *new(R), err
		}
		return callback(ctx, parameter)
	}
}

func readRequestParameter[P any](request *http.Request) (P, error) {
	var parameter P
	webParameter := webResult.GetInstance(parameter)
	err := json.NewDecoder(request.Body).Decode(&webParameter)
	if err != nil {
		return parameter, err
	}
	if validationErr := validate.Struct(webParameter); validationErr != nil {
		return parameter, err
	}
	return webResult.Convert(webParameter).(P), nil
}

func callSendResponse[R any](response http.ResponseWriter, request *http.Request, toCall wrapCall[R]) {
	requestPath := request.URL.Path
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	values, err := toCall(ctx, request)
	if err != nil {
		sendErrorInResponse(response, requestPath, errorHelper.GetHttpStatusError(err), err)
		return
	}
	webResultValues := webResult.Convert(values)
	sendValues(response, requestPath, &webResultValues)
}

func sendValues(response http.ResponseWriter, requestPath string, values any) {
	// On renvoie la réponse au format JSON
	jsonData, err := json.Marshal(values)
	if err != nil {
		sendErrorInResponse(response, requestPath, http.StatusInternalServerError, err)
	}
	writeResponse(response, requestPath, jsonData, http.StatusOK)
}

func sendErrorInResponse(response http.ResponseWriter, requestPath string, statusCode int, err error) {
	message := errorHelper.GetDetailError(err)
	errorWebResult := errorHelper.CreateMessageWebResult(requestPath, statusCode, message)
	jsonData, responseErr := json.Marshal(errorWebResult)
	if responseErr != nil {
		panic("Impossible de renvoyer l'erreur '" + message + "' dans la réponse à la requête '" + requestPath + "'")
	}
	writeResponse(response, requestPath, jsonData, statusCode)
	log.Println("Erreur requête", requestPath, ":", message)
}

func writeResponse(response http.ResponseWriter, requestPath string, jsonData []byte, statusCode int) {
	response.Header().Set("Access-Control-Allow-Origin", "*")
	response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)
	if jsonData == nil {
		return
	}
	_, err := response.Write(jsonData)
	if err != nil {
		panic("Impossible d'écrire l'erreur dans la réponse à la requête ' '" + requestPath + "' :\n" + err.Error() + "\n" + string(jsonData))
	}
}

func stopServerIfPanic() {
	panicMessage := recover()
	if panicMessage != nil {
		log.Println(panicMessage)
		httpServer.ServerStop()
	}
}
