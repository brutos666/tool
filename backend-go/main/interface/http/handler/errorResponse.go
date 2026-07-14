package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"goTool/domain/domainMessage"
	"goTool/interface/http/httpMessage"
	"goTool/interface/webResult"
	"goTool/utilities"
)

func sendError(response http.ResponseWriter, requestPath string, err error) {
	message := utilities.GetError(err)
	messageWebResult := webResult.CreateMessageWebResult(requestPath, GetHttpStatusError(err), message)
	sendMessageInResponse(response, *messageWebResult)
	log.Println("Erreur requête", requestPath, ":", message)
}

func sendHttpError(response http.ResponseWriter, requestPath string, httpError httpMessage.Message) {
	messageWebResult := webResult.ConvertHttpMessageToWebResult(&httpError)
	sendMessageInResponse(response, *messageWebResult)
	log.Println("Erreur requête", requestPath, ":", httpError.GetMessage())
}

func sendMessageInResponse(response http.ResponseWriter, mess webResult.MessageWebResult) {
	jsonData, responseErr := json.Marshal(mess)
	if responseErr != nil {
		panic("Impossible de renvoyer l'erreur '" + mess.GetMessage() + "' dans la réponse à la requête '" + mess.GetPath() + "'")
	}
	writeResponse(response, mess.GetPath(), jsonData, mess.GetHttpStatusCode())
}

func GetHttpStatusError(err error) int {
	_, ok := errors.AsType[domainMessage.Error](err)
	if ok {
		return http.StatusBadRequest
	}
	message, ok := errors.AsType[httpMessage.Message](err)
	if ok {
		return message.GetHttpStatusCode()
	}
	return http.StatusInternalServerError
}
