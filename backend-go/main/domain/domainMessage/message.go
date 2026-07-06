package domainMessage

import (
	"fmt"
	"strings"
)

type Field struct {
	name  string
	value string
}

func (field Field) toString() string { return field.name + "=" + field.value }

type Message struct {
	text          string
	args          []any
	contextFields []Field
}

func (message *Message) AddContext(name, value string) {
	message.contextFields = append(message.contextFields, Field{name: name, value: value})
}

func (message Message) getStringContext() string {
	var contextStrings []string
	for _, field := range message.contextFields {
		contextStrings = append(contextStrings, field.toString())
	}
	return strings.Join(contextStrings, ",")
}

func (message Message) ToString() string {
	if len(message.contextFields) == 0 {
		return fmt.Sprintf(message.text, message.args...)
	}
	errorMessage := message.text + " (%v)"
	errorArgs := append(message.args, message.getStringContext())
	return fmt.Sprintf(errorMessage, errorArgs...)
}

func New(text string) *Message {
	message := new(Message)
	message.text = text
	return message
}

func Messagef(text string, args ...any) Message {
	return Message{text: text, args: args}
}
