package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"goTool/domain/domainMessage"
	"goTool/interface/http/handler/authentication"
	"goTool/interface/http/httpMessage"
	"goTool/interface/webResult"
	"goTool/utilities"
)

func sendError(response http.ResponseWriter, requestPath string, err error) {
	statusCode := getHttpStatusError(err)
	errorMess := utilities.GetError(err)

	jsonData, responseErr := json.Marshal(webResult.CreateMessageWebResult(requestPath, statusCode, errorMess))
	if responseErr != nil {
		panic("Impossible de renvoyer l'erreur '" + errorMess + "' dans la réponse à la requête '" + requestPath + "'")
	}
	if statusCode == http.StatusUnauthorized {
		authentication.SendInvalidToken(response, err.(domainMessage.TokenError).GetCause())
	}
	writeResponse(response, requestPath, jsonData, statusCode)

	log.Println("Erreur requête", requestPath, ":", errorMess)
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
	message, ok := errors.AsType[httpMessage.Message](err)
	if ok {
		return message.GetHttpStatusCode()
	}
	return http.StatusInternalServerError
}
