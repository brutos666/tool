package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"goTool/interface/http/handler/call"
	"goTool/interface/http/handler/middleware"
	"goTool/interface/http/httpMessage"
	"goTool/interface/http/httpServer"
	"goTool/interface/webResult"
)

const SEVEN_DAYS_IN_SECONDS = 604800

func HandleRoute(requestPath, method string, callback call.Callback) {
	http.HandleFunc(requestPath, wrapHandler(method, callback))
}

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
// appel de la méthode liée à la route
// renvoi de la réponse
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
	// Cas particulier de la connection : ajout du cookie
	refreshToken, ok := webResult.GetRefreshToken(values)
	if ok {
		sendRefreshTokenCookie(response, refreshToken)
	}
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

func sendRefreshTokenCookie(response http.ResponseWriter, value string) {
	cookie := http.Cookie{
		Name:     "refreshToken",
		Value:    value,
		Path:     "/",
		MaxAge:   SEVEN_DAYS_IN_SECONDS,
		HttpOnly: true,
		Secure:   true,                    // HTTPS uniquement
		SameSite: http.SameSiteStrictMode, // Protection CSRF
	}
	http.SetCookie(response, &cookie)
}

func writeResponse(response http.ResponseWriter, requestPath string, jsonData []byte, statusCode int) {
	response.Header().Set("Access-Control-Allow-Origin", "*")
	response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	response.Header().Set("Access-Control-Expose-Headers", "WWW-Authenticate")
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)
	if jsonData == nil {
		return
	}
	_, err := response.Write(jsonData)
	if err != nil {
		panic("Impossible d'écrire l'erreur dans la réponse à la requête ' '" + requestPath + "' :\n" + err.Error() + "\n" + string(jsonData))
	}
	fmt.Println("Headers envoyés :", response.Header())
}

func stopServerIfPanic() {
	panicMessage := recover()
	if panicMessage != nil {
		log.Println(panicMessage)
		httpServer.ServerStop()
	}
}
