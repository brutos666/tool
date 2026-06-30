package errorHelper

import "time"

type MessageWebResult struct {
	StatusCode int       `json:"status"`
	Error      string    `json:"error"`
	Path       string    `json:"path"`
	Timestamp  time.Time `json:"timestamp"`
}

func CreateMessageWebResult(path string, statusCode int, error string) *MessageWebResult {
	messageWebResult := new(MessageWebResult)
	messageWebResult.StatusCode = statusCode
	messageWebResult.Error = error
	messageWebResult.Path = path
	messageWebResult.Timestamp = time.Now()
	return messageWebResult
}
