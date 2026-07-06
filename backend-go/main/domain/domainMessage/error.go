// Package domainMessage fournit les structures permettant de créer un message ou une erreur dans le but de renvoyer le résultat à l'interface
package domainMessage

type Error struct {
	message Message
}

func (error Error) AddContext(name, value string) {
	error.message.AddContext(name, value)
}

func (error Error) Error() string {
	return error.message.ToString()
}

func NewError(text string) *Error {
	message := New(text)
	err := new(Error)
	err.message = *message
	return err
}

func Errorf(error string, args ...any) Error {
	message := Messagef(error, args...)
	return Error{message: message}
}
