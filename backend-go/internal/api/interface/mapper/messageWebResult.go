package mapper

import (
	"net/http"
	"time"

	"goTool/internal/api/domain/domainMessage"
	"goTool/internal/api/interface/handler/responseMessage"
)

type MessageWebResult struct {
	StatusCode int       `json:"status"`
	Error      string    `json:"error"`
	Path       string    `json:"path"`
	Timestamp  time.Time `json:"timestamp"`
}

func (message MessageWebResult) GetHttpStatusCode() int { return message.StatusCode }
func (message MessageWebResult) GetPath() string        { return message.Path }
func (message MessageWebResult) GetMessage() string     { return message.Error }

func CreateMessageWebResult(path string, statusCode int, error string) *MessageWebResult {
	messageWebResult := new(MessageWebResult)
	// TODO : côté front, distinguer les messages des erreurs par rapport au statusCode
	messageWebResult.StatusCode = statusCode
	messageWebResult.Error = error
	messageWebResult.Path = path
	messageWebResult.Timestamp = time.Now()
	return messageWebResult
}

func ConvertHttpMessageToWebResult(message *responseMessage.Message) *MessageWebResult {
	messageWebResult := new(MessageWebResult)
	// TODO : côté front, distinguer les messages des erreurs par rapport au statusCode
	messageWebResult.StatusCode = message.GetHttpStatusCode()
	messageWebResult.Error = message.GetMessage()
	messageWebResult.Path = message.GetPath()
	messageWebResult.Timestamp = time.Now()
	return messageWebResult
}

func ConvertMessageToWebResult(message domainMessage.Message) *MessageWebResult {
	messageWebResult := new(MessageWebResult)
	// TODO : côté front, distinguer les messages des erreurs par rapport au statusCode
	messageWebResult.StatusCode = http.StatusOK
	messageWebResult.Error = message.ToString()
	messageWebResult.Path = ""
	messageWebResult.Timestamp = time.Now()
	return messageWebResult
}
