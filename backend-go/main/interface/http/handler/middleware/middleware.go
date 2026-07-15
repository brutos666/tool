package middleware

import (
	"net/http"

	"goTool/domain"
	"goTool/interface/http/handler/authentication"
	"goTool/interface/http/httpMessage"
	"goTool/interface/http/httpServer"
)

const SERVER_IS_STOPPING string = "Serveur en cours d'arrêt : la requête ne peut pas être exécutée"

func CallMiddlewares(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, error) {
	err := CheckServerRunning(request.URL.Path)
	if err != nil {
		return nil, err
	}
	return authentication.Authenticate(response, request)
}

func CheckServerRunning(requestPath string) error {
	if httpServer.ServerIsStop() {
		return httpMessage.NewError(SERVER_IS_STOPPING, requestPath, http.StatusServiceUnavailable)
	}
	return nil
}

func AuthenticateWithRefreshToken(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, error) {
	return authentication.AuthenticateWithRefreshToken(response, request)
}
