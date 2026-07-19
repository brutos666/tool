package handler

import (
	"context"
	"log"
	"net/http"
	"time"

	"goTool/domain"
	"goTool/interface/handler/authentication"
	"goTool/interface/handler/call"
	"goTool/interface/handler/responseMessage"
	"goTool/interface/handler/route"
)

const (
	METHOD_IS_NOT_ALLOWED = "Méthode non autorisée"
	REQUEST_TIMEOUT       = 100 * time.Second
)

func HandleGetRoute(requestPath string, toCall call.WrappedCall, dataAccessProvider domain.DataAccessProvider) {
	http.HandleFunc(requestPath, getHandler(http.MethodGet, toCall, dataAccessProvider))
}

func HandlePostRoute(requestPath string, toCall call.WrappedCall, dataAccessProvider domain.DataAccessProvider) {
	http.HandleFunc(requestPath, getHandler(http.MethodPost, toCall, dataAccessProvider))
}

// getHandler construit la fonction contenant les appels aux middlewares, ainsi que l'appel du service
func getHandler(method string, toCall call.WrappedCall, dataAccessProvider domain.DataAccessProvider) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		requestMethod := request.Method

		log.Println("Traitement de la requête", requestPath, "en cours...")

		if method != requestMethod && requestMethod != http.MethodOptions {
			err := responseMessage.NewError(METHOD_IS_NOT_ALLOWED, requestPath, http.StatusMethodNotAllowed)
			sendError(response, requestPath, err)
			return
		}

		err := checkServerRunning(requestPath)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}

		dataAccess := dataAccessProvider.GetInstance()
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
			err := responseMessage.NewError(METHOD_IS_NOT_ALLOWED, requestPath, http.StatusMethodNotAllowed)
			sendError(response, requestPath, err)
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

	connectedUser, err := authentication.Authenticate(request)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}
	values, err := toCall(ctx, call.WithContext(dataAccess, connectedUser), request)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}
	sendValues(response, requestPath, values)
}

func processLoginRequest(response http.ResponseWriter, request *http.Request, toCall call.WrappedCall, dataAccess domain.DataAccess) {
	requestPath := request.URL.Path

	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	tokenGenerator := new(authentication.TokensGenerator)
	callContext := call.WithLoginContext(dataAccess, tokenGenerator)

	if requestPath == route.REFRESH {
		connectedUser, err := authentication.AuthenticateWithRefreshToken(request)
		if err != nil {
			sendError(response, requestPath, err)
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

	sendLoginValues(response, requestPath, loggedUser.(*domain.LoggedUser), tokenGenerator.GetAccessToken())
}
