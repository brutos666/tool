package handler

import (
	"context"
	"log"
	"net/http"
	"time"

	"goTool/interface/handler/authentication"
	"goTool/interface/handler/responseMessage"
	"goTool/interface/handler/route"
)

const (
	METHOD_IS_NOT_ALLOWED = "Méthode non autorisée"
	FILE_TOO_BIG          = "Le fichier est trop gros"
	REQUEST_TIMEOUT       = 100 * time.Second
	MAX_UPLOAD            = 10 << 20 // 10 Mo
)

func HandleGetRoute(requestPath string, toCall responseRequestCall) {
	http.HandleFunc(requestPath, getHandler(http.MethodGet, toCall))
}

func HandlePostRoute(requestPath string, toCall responseRequestCall) {
	http.HandleFunc(requestPath, getHandler(http.MethodPost, toCall))
}

// getHandler construit la fonction contenant les appels aux middlewares, ainsi que l'appel du service
func getHandler(method string, toCall responseRequestCall) func(response http.ResponseWriter, request *http.Request) {
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

		switch requestMethod {
		case http.MethodPost:
			if requestPath == route.REFRESH || requestPath == route.SIGNUP || requestPath == route.LOGIN {
				processLoginRequest(response, request, toCall)
			} else {
				processRequest(response, request, toCall)
			}
		case http.MethodGet:
			processRequest(response, request, toCall)
		case http.MethodOptions:
			writeJsonResponse(response, requestPath, nil, http.StatusOK)
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
func processRequest(response http.ResponseWriter, request *http.Request, toCall responseRequestCall) {
	requestPath := request.URL.Path

	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	// NOTE : Sécurité - Contrôle que l'utilisateur est bien authentifié
	connectedUser, err := authentication.Authenticate(request)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}
	toCall(ctx, WithConnectedUser(connectedUser), response, request)
}

func processLoginRequest(response http.ResponseWriter, request *http.Request, toCall responseRequestCall) {
	requestPath := request.URL.Path

	ctx, cancel := context.WithTimeout(request.Context(), REQUEST_TIMEOUT)
	defer cancel()
	defer stopServerIfPanic()

	callContext := WithTokenGenerator(new(authentication.TokensGenerator))

	if requestPath == route.REFRESH {
		// NOTE : Sécurité - Récupère l'utilisateur à partir du jeton "refresh" stocké dans le cookie
		connectedUser, err := authentication.AuthenticateWithRefreshToken(request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}
		callContext.AddConnectedUser(connectedUser)
	}

	toCall(ctx, callContext, response, request)
}
