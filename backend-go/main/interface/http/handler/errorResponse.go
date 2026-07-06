package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"goTool/domain/specificError"
	"goTool/interface/http/httpMessage"
	"goTool/interface/webResult"

	"github.com/lib/pq"
)

func sendError(response http.ResponseWriter, requestPath string, err error) {
	message := getDetailError(err)
	messageWebResult := webResult.CreateMessageWebResult(requestPath, GetHttpStatusError(err), message)
	sendMessageInResponse(response, *messageWebResult)
	log.Println("Erreur requête", requestPath, ":", message)
}

func sendHttpError(response http.ResponseWriter, requestPath string, httpError httpMessage.Message) {
	messageWebResult := webResult.ConvertMessageToWebResult(&httpError)
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
	_, ok := errors.AsType[specificError.FunctionalError](err)
	if ok {
		return http.StatusBadRequest
	}
	message, ok := errors.AsType[httpMessage.Message](err)
	if ok {
		return message.GetHttpStatusCode()
	}
	return http.StatusInternalServerError
}

func getDetailError(err error) string {
	// Le projet utilise la fonction errors.Join. Il faut donc traiter chaque erreur pour afficher le détail
	switch x := err.(type) {
	case interface{ Unwrap() []error }:
		var b strings.Builder
		errorList := x.Unwrap()
		for index, unwrapErr := range errorList {
			_, _ = b.WriteString(getError(unwrapErr))
			if index < len(errorList)-1 {
				_, _ = b.WriteRune('\n')
			}
		}
		return b.String()
	}

	return getError(err)
}

func getError(err error) string {
	pqErr, ok := errors.AsType[*pq.Error](err)
	if ok {
		return pqErr.ErrorWithDetail()
	}
	return err.Error()
}
