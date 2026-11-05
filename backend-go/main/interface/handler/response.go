package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"goTool/domain/domainMessage"
	"goTool/interface/handler/authentication"
	"goTool/interface/handler/responseMessage"
	"goTool/interface/mapper"
	"goTool/utilities"
)

func sendOkResponse(response http.ResponseWriter, requestPath string, webResultValues any) {
	jsonData, err := json.Marshal(webResultValues)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}
	writeResponse(response, requestPath, jsonData, http.StatusOK)
}

func sendError(response http.ResponseWriter, requestPath string, err error) {
	statusCode := getHttpStatusError(err)
	errorMess := utilities.GetError(err)

	jsonData, responseErr := json.Marshal(mapper.CreateMessageWebResult(requestPath, statusCode, errorMess))
	if responseErr != nil {
		panic("Impossible de renvoyer l'erreur '" + errorMess + "' dans la réponse à la requête '" + requestPath + "'")
	}
	if statusCode == http.StatusUnauthorized {
		authentication.SendInvalidToken(response, err.(domainMessage.TokenError).GetCause())
	}
	writeResponse(response, requestPath, jsonData, statusCode)

	log.Println("Erreur requête", requestPath, ":", errorMess)
}

func writeResponse(response http.ResponseWriter, requestPath string, jsonData []byte, statusCode int) {
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

func getHttpStatusError(err error) int {
	_, ok := errors.AsType[domainMessage.Error](err)
	if ok {
		return http.StatusBadRequest
	}
	_, ok = errors.AsType[domainMessage.TokenError](err)
	if ok {
		return http.StatusUnauthorized
	}
	message, ok := errors.AsType[*responseMessage.Message](err)
	if ok {
		return message.GetHttpStatusCode()
	}
	return http.StatusInternalServerError
}
