package handler

import "time"

type errorWebResult struct {
	StatusCode int `json:"status"`
	Error string `json:"error"`
  Path string `json:"path"`
	Timestamp time.Time `json:"timestamp"`
}

type messageWebResult struct {
	StatusCode int `json:"status"`
	Message string `json:"message"`
  Path string `json:"path"`
	Timestamp time.Time `json:"timestamp"`
}

func createErrorWebResult(path string, statusCode int, message string) *errorWebResult {
	errWebResult := new(errorWebResult)
	errWebResult.StatusCode = statusCode
	errWebResult.Error = message
	errWebResult.Path = path
	errWebResult.Timestamp = time.Now()
	return errWebResult
}

func createMessageWebResult(path string, statusCode int, message string) *messageWebResult {
	messageWebResult := new(messageWebResult)
	messageWebResult.StatusCode = statusCode
	messageWebResult.Message = message
	messageWebResult.Path = path
	messageWebResult.Timestamp = time.Now()
	return messageWebResult
}