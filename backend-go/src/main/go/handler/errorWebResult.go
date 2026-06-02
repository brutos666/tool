package handler

import "time"

type errorWebResult struct {
	StatusCode int `json:"status"`
	Error string `json:"error"`
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