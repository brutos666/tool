package handler

import (
	"context"
	"io"

	"goTool/domain"
	"goTool/generic"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// Répertorie tous les appels possibles côté application
type (
	NoDataAccessCall[R any] func(context context.Context) (R, error)
	DataAccessCall[R any]   func(context context.Context, dataAccessId int) (R, error)
	ParamCall[P, R any]     func(context context.Context, dataAccessId int, parameter P) (R, error)
	FileParamCall[R any]    func(context context.Context, fileReader io.Reader) (R, error)
	LoginCall[P, R any]     func(context context.Context, dataAccessId int, tokenGeneration domain.TokensProduct, parameter P) (R, error)
	RefreshCall             func(context context.Context, dataAccessId int, tokenGeneration domain.TokensProduct, user domain.ConnectedUser) (*domain.LoggedUser, error)
)

// AsNoDataAccessCall englobe l'appel à la fonction dans un appel plus générique
func AsNoDataAccessCall[R any](callback NoDataAccessCall[R]) responseRequestCall {
	return Wrapper[R]{}.forNoAccessCall(callback).wrap()
}

// AsDataAccessCall englobe dans des fonctions imbriqués l'appel à la fonction (démarrage et l'arrêt bdd, conversion de la réponse)
func AsDataAccessCall[R any](callback DataAccessCall[R], dataAccessService generic.DataAccessService, accessType string) responseRequestCall {
	return Wrapper[R]{}.forDataAccessCall(callback).withDataAccessService(dataAccessService, accessType).wrap()
}

// AsParamDataAccessCall englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse)
func AsParamDataAccessCall[P, R any](callback ParamCall[P, R], dataAccessService generic.DataAccessService, accessType string) responseRequestCall {
	return ParamWrapper[P, R]{}.forParamCall(callback).withDataAccessService(dataAccessService, accessType).wrap()
}

// AsLoginCall englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse) pour la connexion ou la création du compte avec connexion
func AsLoginCall[P, R any](callback LoginCall[P, R], dataAccessService generic.DataAccessService, accessType string) responseRequestCall {
	return ParamWrapper[P, R]{}.forLoginCall(callback).withDataAccessService(dataAccessService, accessType).wrap()
}

// AsRefreshCall englobe dans des fonctions imbriqués l'appel à la fonction (bdd, conversion réponse) pour le rafraîchissement de l'authentification à partir du jeton dédié
func AsRefreshCall(callback RefreshCall, dataAccessService generic.DataAccessService, accessType string) responseRequestCall {
	return Wrapper[*domain.LoggedUser]{}.forRefreshCall(callback).withDataAccessService(dataAccessService, accessType).wrap()
}

func AsFileParamCall[R any](callback FileParamCall[R]) responseRequestCall {
	return Wrapper[R]{}.forFileParamCall(callback).wrap()
}
