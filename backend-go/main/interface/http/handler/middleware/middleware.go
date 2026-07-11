package middleware

import (
	"net/http"

	"goTool/domain"
	"goTool/interface/http/handler/authentication"
	"goTool/interface/http/httpMessage"
	"goTool/interface/http/httpServer"
)

const SERVER_IS_STOPPING string = "Serveur en cours d'arrêt : la requête ne peut pas être exécutée"

func CallMiddlewares(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, *httpMessage.Message) {
	message := CheckServerRunning(request.URL.Path)
	if message != nil {
		return nil, message
	}
	connectedUser, message := authentication.Authenticate(response, request)
	if message != nil {
		return nil, message
	}
	return connectedUser, nil
}

func CheckServerRunning(requestPath string) *httpMessage.Message {
	if httpServer.ServerIsStop() {
		return httpMessage.NewError(SERVER_IS_STOPPING, requestPath, http.StatusServiceUnavailable)
	}
	return nil
}

func AuthenticateWithRefreshToken(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, *httpMessage.Message) {
	return authentication.AuthenticateWithRefreshToken(response, request)
}
