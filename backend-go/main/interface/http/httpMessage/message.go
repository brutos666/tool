package httpMessage

import (
	"fmt"
	"net/http"
)

type Message struct {
	path       string
	message    string
	httpStatus int
}

func (message Message) GetHttpStatusCode() int { return message.httpStatus }
func (message Message) GetPath() string        { return message.path }
func (message Message) GetMessage() string     { return message.message }

func (message Message) IsError() bool { return message.httpStatus != http.StatusOK }

func (message Message) Error() string {
	return fmt.Sprint(message.message)
}

func NewError(error string, path string, httpStatus int) *Message {
	return &Message{message: error, path: path, httpStatus: httpStatus}
}

func NewMessage(message string, httpStatus int) *Message {
	return &Message{message: message, httpStatus: httpStatus}
}
