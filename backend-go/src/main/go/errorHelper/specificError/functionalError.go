package specificError

import (
	"fmt"
	"strings"
)

type Field struct {
	name  string
	value string
}

func (field Field) toString() string { return field.name + "=" + field.value }

type FunctionalError struct {
	message       string
	args          []any
	contextFields []Field
}

func (error *FunctionalError) AddContext(name, value string) {
	error.contextFields = append(error.contextFields, Field{name: name, value: value})
}

func (error FunctionalError) getStringContext() string {
	var contextStrings []string
	for _, field := range error.contextFields {
		contextStrings = append(contextStrings, field.toString())
	}
	return strings.Join(contextStrings, ",")
}

func (error FunctionalError) Error() string {
	if len(error.contextFields) == 0 {
		return fmt.Sprintf(error.message, error.args...)
	}
	errorMessage := error.message + " (%v)"
	errorArgs := append(error.args, error.getStringContext())
	return fmt.Sprintf(errorMessage, errorArgs...)
}

func NewErrorFunctional(message string) FunctionalError {
	return FunctionalError{message: message}
}

func Errorf(message string, args ...any) FunctionalError {
	return FunctionalError{message: message, args: args}
}
