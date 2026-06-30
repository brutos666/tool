// Package errorHelper gère les erreurs
package errorHelper

import (
	"errors"
	"net/http"
	"strings"

	"goTool/errorHelper/specificError"

	"github.com/lib/pq"
)

// New crée une nouvelle erreur avec un message.
func New(message string) error {
	return errors.New(message)
}

func GetDetailError(err error) string {
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

func GetHttpStatusError(err error) int {
	_, ok := errors.AsType[specificError.FunctionalError](err)
	if ok {
		return http.StatusBadRequest
	}
	return http.StatusInternalServerError
}
