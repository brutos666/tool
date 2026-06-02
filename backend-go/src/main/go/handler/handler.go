package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

const NOT_ALLOWED_MESSAGE = "Méthode non autorisée"
var webServer requestServer

// Type de fonction permettant de récupérer n'importe quel type d'objet
type getFunction[R any] func() (R, error)
type handleFunction[response http.ResponseWriter, request *http.Request] func(response, request)

func Start() {
	webServer = *createServer()
	webServer.mustWaitEndOfServer()
	go webServer.start()
	// Attend l'arrêt du serveur
	webServer.waitEndOfServer()
}
func Stop(requestPath string) {
	stopApp := func () (any, error) {
		webServer.setStop()
		return errors.New("Le serveur va être arrêté dès que toutes les requêtes en cours seront terminées"), nil
	}
	functionToLaunch := func(response http.ResponseWriter, request *http.Request) {
		log.Println("Traitement de la requête", request.URL.Path, "en cours...")
		process(response, request, stopApp)
		webServer.stop()
	}

	http.HandleFunc(requestPath, functionToLaunch)
}

func Handle[R any](requestPath string, callback getFunction[R]) {
	if (webServer.isStop()) {
		errorFunc := func() (any, error) {
			return nil, errors.New("Serveur en cours d'arrêt : la requête ne peut pas être exécutée")
		}
		http.HandleFunc(requestPath, getFunctionToLaunch(errorFunc))
		return
	}
	http.HandleFunc(requestPath, getFunctionToLaunch(callback))
}

func getFunctionToLaunch[R any](callback getFunction[R]) func(response http.ResponseWriter, request *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		webServer.addGoRoutineToWait()
		go process(response, request, callback)
		log.Println("Traitement de la requête", request.URL.Path, "en cours...")
	}
}

func process[R any](response http.ResponseWriter, request *http.Request, callback getFunction[R]) {
	values, err := callback()
	defer webServer.alertGoRoutineIsDone()
	if (err != nil) {
		sendErrorInResponse(response, request, http.StatusInternalServerError, err)
	} else {
		sendValues(response, request, &values)
	}
	log.Println("Traitement de la requête", request.URL.Path, "terminée")
}

func sendValues(response http.ResponseWriter, request *http.Request, values any) {
	response.Header().Set("Access-Control-Allow-Origin", "*")
	response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	var err error
	switch request.Method {
	case http.MethodGet:
		// On renvoie la réponse au format JSON
		response.Header().Set("Content-Type", "application/json")
		response.WriteHeader(http.StatusOK)
		err = json.NewEncoder(response).Encode(values);
		if (err != nil) {
			sendErrorInResponse(response, request, http.StatusInternalServerError, err)
		}
	default:
		sendErrorInResponse(response, request, http.StatusMethodNotAllowed, errors.New(NOT_ALLOWED_MESSAGE))
	}
}

func sendErrorInResponse(response http.ResponseWriter, request *http.Request, statusCode int, err error) {
	response.WriteHeader(statusCode)
	errorWebResult := createErrorWebResult(request.URL.Path, statusCode, err.Error())
	err = json.NewEncoder(response).Encode(errorWebResult);
	if (err != nil) {
		response.WriteHeader(http.StatusInternalServerError)
		panic("Impossible de renvoyer l'erreur '" + err.Error() + "' dans la réponse à la requête '" + request.URL.RequestURI() + "'")
	}
}
