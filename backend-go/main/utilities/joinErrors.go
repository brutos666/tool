package utilities

import (
	"errors"
	"strings"

	"github.com/lib/pq"
)

// JoinErrors permet juste d'éviter une arborescence d'erreurs lorsque l'on veut ajouter une nouvelle erreur à une liste d'erreur avec la méthode errors.Join (aide en debug)
func JoinErrors(err error, errs ...error) error {
	errorList := getErrorList(err)
	for _, errToAdd := range errs {
		errorList = append(errorList, errToAdd)
	}
	return errors.Join(errorList...)
}

func getErrorList(err error) []error {
	errorList := make([]error, 0)
	wrapErrors, ok := err.(interface{ Unwrap() []error })
	if ok {
		errs := wrapErrors.Unwrap()
		for _, err := range errs {
			if err != nil {
				errorList = append(errorList, getErrorList(err)...)
			}
		}
		return errorList
	}
	return []error{err}
}

// GetError fourni l'erreur détaillé dans le cas d'une erreur postGreSql et concatène les erreurs séparées par des sauts de ligne si error contient plusieurs erreurs
func GetError(err error) string {
	errs := getErrorList(err)
	if len(errs) == 1 {
		return getMostDetailError(errs[0])
	}
	var b strings.Builder
	_, _ = b.WriteString(getMostDetailError(errs[0]))
	for _, eachErr := range errs[1:] {
		_, _ = b.WriteRune('\n')
		_, _ = b.WriteString(getMostDetailError(eachErr))
	}
	return b.String()
}

func getMostDetailError(err error) string {
	pqErr, ok := errors.AsType[*pq.Error](err)
	if ok {
		return pqErr.ErrorWithDetail()
	}
	return err.Error()
}
