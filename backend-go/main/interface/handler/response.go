package handler

import (
	"bytes"
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

func sendJsonResponse(response http.ResponseWriter, requestPath string, webResultValues any) {
	jsonData, err := json.Marshal(webResultValues)
	if err != nil {
		sendError(response, requestPath, err)
		return
	}
	writeJsonResponse(response, requestPath, jsonData, http.StatusOK)
}

func sendCsvResponse(response http.ResponseWriter, requestPath string, buffer *bytes.Buffer, fileName string) {
	response.Header().Set("Content-Type", "text/csv; charset=utf-8")
	response.Header().Set("Content-Disposition", `inline; filename=" `+fileName+`.csv"`)
	response.WriteHeader(http.StatusOK)
	size, err := response.Write(buffer.Bytes())
	if err != nil {
		// Supposition : si l'écriture échoue ici, c'est qu'il y a quelque chose de grave...
		panic(err)
	}
	log.Printf("Export du fichier %s : %d octets", requestPath, size)
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
	writeJsonResponse(response, requestPath, jsonData, statusCode)

	log.Println("Erreur requête", requestPath, ":", errorMess)
}

func writeJsonResponse(response http.ResponseWriter, requestPath string, jsonData []byte, statusCode int) {
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
