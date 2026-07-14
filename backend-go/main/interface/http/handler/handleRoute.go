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

func HandleGetRoute(requestPath string, toCall call.WrappedCall, dataAccess domain.DataAccess) {
	http.HandleFunc(requestPath, getHandler(http.MethodGet, toCall, dataAccess))
}

func HandlePostRoute(requestPath string, toCall call.WrappedCall, dataAccess domain.DataAccess) {
	http.HandleFunc(requestPath, getHandler(http.MethodPost, toCall, dataAccess))
}

// getHandler construit la fonction contenant les appels aux middlewares, ainsi que l'appel du service
func getHandler(method string, toCall call.WrappedCall, dataAccess domain.DataAccess) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		requestMethod := request.Method

		log.Println("Traitement de la requête", requestPath, "en cours...")

		if method != requestMethod && requestMethod != http.MethodOptions {
			httpError := httpMessage.NewError(METHOD_IS_NOT_ALLOWED, requestPath, http.StatusMethodNotAllowed)
			sendHttpError(response, requestPath, *httpError)
			return
		}
		// FIXME l'instance d'accès à la base de données est la même quelque pour toutes les requêtes.
		// TODO : faire des tests unitaire pour faire planter puis corriger

		switch requestMethod {
		case http.MethodPost:
			if requestPath == route.REFRESH || requestPath == route.SIGNUP || requestPath == route.LOGIN {
				processLoginRequest(response, request, toCall, dataAccess)
			} else {
				processRequest(response, request, toCall, dataAccess)
			}
		case http.MethodGet:
			processRequest(response, request, toCall, dataAccess)
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
func processRequest(response http.ResponseWriter, request *http.Request, toCall call.WrappedCall, dataAccess domain.DataAccess) {
	requestPath := request.URL.Path

	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	connectedUser, httpError := middleware.CallMiddlewares(response, request)
	if httpError != nil {
		sendHttpError(response, requestPath, *httpError)
		return
	}
	values, err := toCall(ctx, call.WithContext(dataAccess, connectedUser), request)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}

	webResultValues := webResult.ConvertToWebResult(values)
	sendValues(response, requestPath, &webResultValues)
}

func processLoginRequest(response http.ResponseWriter, request *http.Request, toCall call.WrappedCall, dataAccess domain.DataAccess) {
	requestPath := request.URL.Path

	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	httpError := middleware.CheckServerRunning(requestPath)
	if httpError != nil {
		sendHttpError(response, requestPath, *httpError)
		return
	}

	tokenGenerator := new(authentication.TokensGenerator)
	callContext := call.WithLoginContext(dataAccess, tokenGenerator)

	if requestPath == route.REFRESH {
		connectedUser, httpError := middleware.AuthenticateWithRefreshToken(response, request)
		if httpError != nil {
			sendHttpError(response, requestPath, *httpError)
			return
		}
		callContext.AddConnectedUser(connectedUser)
	}

	loggedUser, err := toCall(ctx, callContext, request)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}

	authentication.SendRefreshTokenCookie(response, tokenGenerator.GetRefreshToken())

	webResultLoggedUser := webResult.ConvertLoggedUserToWebResult(loggedUser.(*domain.LoggedUser), tokenGenerator.GetAccessToken())
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
