package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"goTool/domain"
	"goTool/interface/http/handler/authentication"
	"goTool/interface/http/handler/call"
	"goTool/interface/http/handler/middleware"
	"goTool/interface/http/handler/route"
	"goTool/interface/http/httpMessage"
	"goTool/interface/http/httpServer"
	"goTool/interface/webResult"
)

func HandleRoute(requestPath, method string, callback call.Callback) {
	http.HandleFunc(requestPath, wrapHandler(method, callback))
}

// wrapHandler construit la fonction contenant les appels aux middlewares, ainsi que l'appel du service
func wrapHandler(method string, callback call.Callback) func(response http.ResponseWriter, request *http.Request) {
	toCall := call.WrapCallback(callback)

	return func(response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		requestMethod := request.Method

		log.Println("Traitement de la requête", requestPath, "en cours...")

		if method != requestMethod && requestMethod != http.MethodOptions {
			httpError := httpMessage.NewError(METHOD_IS_NOT_ALLOWED, requestPath, http.StatusMethodNotAllowed)
			sendHttpError(response, requestPath, *httpError)
			return
		}

		switch requestMethod {
		case http.MethodPost:
			processRequest(response, request, toCall)
		case http.MethodGet:
			processRequest(response, request, toCall)
		case http.MethodOptions:
			writeResponse(response, requestPath, nil, http.StatusOK)
		default:
			httpError := httpMessage.NewError(METHOD_IS_NOT_ALLOWED, requestPath, http.StatusMethodNotAllowed)
			sendHttpError(response, requestPath, *httpError)
		}

		log.Println("Traitement de la requête", requestPath, "terminée")
	}
}

// appel Middleware pour vérifier si le serveur est en cours d'arrêt et si l'utilisateur est authentifié
// appel de la méthode liée à la route (service)
// envoi de la réponse
func processRequest(response http.ResponseWriter, request *http.Request, toCall call.WrappedCall) {
	requestPath := request.URL.Path
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	connectedUser, httpError := middleware.CallMiddlewares(response, request)
	if httpError != nil {
		sendHttpError(response, requestPath, *httpError)
		return
	}
	values, err := toCall(ctx, connectedUser, request)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}
	webResultValues := webResult.ConvertToWebResult(values)
	sendValues(response, requestPath, &webResultValues)
}

// HandleLoginRoute Traitement particulier lorsque l'on doit s'authentifier
func HandleLoginRoute[P any](requestPath string, callback call.CallUserToLog[P]) {
	http.HandleFunc(requestPath, wrapLoginHandler(callback))
}

func wrapLoginHandler[P any](callback call.CallUserToLog[P]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		requestMethod := request.Method

		log.Println("Traitement de la requête", requestPath, "en cours...")

		switch requestMethod {
		case http.MethodPost:
			processLoginRequest(response, request, callback)
		case http.MethodOptions:
			writeResponse(response, requestPath, nil, http.StatusOK)
		default:
			httpError := httpMessage.NewError(METHOD_IS_NOT_ALLOWED, requestPath, http.StatusMethodNotAllowed)
			sendHttpError(response, requestPath, *httpError)
		}

		log.Println("Traitement de la requête", requestPath, "terminée")
	}
}

func processLoginRequest[P any](response http.ResponseWriter, request *http.Request, callback call.CallUserToLog[P]) {
	var err error
	var loggedUser *domain.LoggedUser
	requestPath := request.URL.Path
	tokenGenerator := new(authentication.TokensGenerator)
	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	httpError := middleware.CheckServerRunning(requestPath)
	if httpError != nil {
		sendHttpError(response, requestPath, *httpError)
		return
	}

	if requestPath == route.REFRESH {
		connectedUser, httpError := middleware.AuthenticateWithRefreshToken(response, request)
		if httpError != nil {
			sendHttpError(response, requestPath, *httpError)
			return
		}
		loggedUser, err = call.CallRefreshCallback(ctx, tokenGenerator, *connectedUser, callback)
	} else {
		loggedUser, err = call.CallLoginCallback(ctx, tokenGenerator, request, callback)
	}
	if err != nil {
		sendError(response, requestPath, err)
		return
	}

	authentication.SendRefreshTokenCookie(response, tokenGenerator.GetRefreshToken())
	webResultLoggedUser := webResult.ConvertLoggedUserToWebResult(loggedUser, tokenGenerator.GetAccessToken())
	sendValues(response, requestPath, &webResultLoggedUser)
}

func sendValues(response http.ResponseWriter, requestPath string, values any) {
	// On renvoie la réponse au format JSON
	jsonData, err := json.Marshal(values)
	if err != nil {
		httpError := httpMessage.NewError(err.Error(), requestPath, http.StatusInternalServerError)
		sendHttpError(response, requestPath, *httpError)
		return
	}
	writeResponse(response, requestPath, jsonData, http.StatusOK)
}

func writeResponse(response http.ResponseWriter, requestPath string, jsonData []byte, statusCode int) {
	/*
		// Dans le cas où le serveur de fichier du front est différent du serveur des requêtes api
		response.Header().Set("Access-Control-Allow-Origin", config.GetServerUrl())
		response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		response.Header().Set("Access-Control-Expose-Headers", "WWW-Authenticate")
	*/
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)
	fmt.Println("Headers envoyés :", response.Header())
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
