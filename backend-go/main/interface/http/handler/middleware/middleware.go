package middleware

import (
	"authentication/tokens"
	"net/http"
	"strings"

	"goTool/domain"
	"goTool/interface/http/httpMessage"
	"goTool/interface/http/httpServer"
)

const (
	SERVER_IS_STOPPING string = "Serveur en cours d'arrêt : la requête ne peut pas être exécutée"
	NOT_LOGGED         string = "Vous n'êtes pas connecté"
	NOT_AUTHORIZED     string = "Accès non autorisé"
)

func CallMiddlewares(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, *httpMessage.Message) {
	message := checkServerRunning(request.URL.Path)
	if message != nil {
		return nil, message
	}
	connectedUser, message := authenticate(response, request)
	if message != nil {
		return nil, message
	}
	return connectedUser, nil
}

func authenticate(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, *httpMessage.Message) {
	requestPath := request.URL.Path
	if requestPath == "/Stop" ||
		requestPath == "/Verify" ||
		strings.HasPrefix(requestPath, "/api/authenticate/") {
		return nil, nil
	}
	authHeader := request.Header.Get("Authorization")
	if authHeader == "" {
		response.Header().Set("WWW-Authenticate", "Bearer error=\"no_token\"")
		return nil, httpMessage.NewError(NOT_LOGGED, requestPath, http.StatusUnauthorized)
	}
	// Enlever le mot clé Bearer que l'on retrouve dans le header
	auth, ok := strings.CutPrefix(authHeader, "Bearer")
	if !ok {
		response.Header().Set("WWW-Authenticate", "Bearer  error=\"invalid_token\"")
		return nil, httpMessage.NewError(NOT_AUTHORIZED, requestPath, http.StatusUnauthorized)
	}
	auth = strings.Trim(auth, " ")
	connectedUser, err := tokens.Validate[domain.ConnectedUser](auth)
	if err != nil {
		if tokens.ErrorIsTokenExpired(err) {
			response.Header().Set("WWW-Authenticate", "Bearer error=\"token_expired\"")
		} else {
			response.Header().Set("WWW-Authenticate", "Bearer error\"invalid_token\"")
		}
		return nil, httpMessage.NewError(err.Error(), requestPath, http.StatusUnauthorized)
	}
	return connectedUser, nil
}

func checkServerRunning(requestPath string) *httpMessage.Message {
	if httpServer.ServerIsStop() {
		return httpMessage.NewError(SERVER_IS_STOPPING, requestPath, http.StatusServiceUnavailable)
	}
	return nil
}
