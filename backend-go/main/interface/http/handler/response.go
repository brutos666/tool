package handler

import (
	"encoding/json"
	"net/http"

	"goTool/domain"
	"goTool/interface/webResult"
)

func sendValues(response http.ResponseWriter, requestPath string, values any) {
	webResultValues := webResult.ConvertToWebResult(values)
	sendOkResponse(response, requestPath, webResultValues)
}

func sendLoginValues(response http.ResponseWriter, requestPath string, loggedUser *domain.LoggedUser, accessToken string) {
	webResultValues := webResult.ConvertLoggedUserToWebResult(loggedUser, accessToken)
	sendOkResponse(response, requestPath, webResultValues)
}

func sendOkResponse(response http.ResponseWriter, requestPath string, webResultValues any) {
	jsonData, err := json.Marshal(webResultValues)
	if err != nil {
		sendError(response, requestPath, err)
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
	if jsonData == nil {
		return
	}
	_, err := response.Write(jsonData)
	if err != nil {
		panic("Impossible de renvoyer le résultat de la requête ' '" + requestPath + "' :\n" + err.Error() + "\n" + string(jsonData))
	}
}
