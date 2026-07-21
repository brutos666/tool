package handler

import (
	"context"

	"goTool/domain"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// Répertorie tous les appels possibles côté application
type (
	NoDataAccessCall[R any] func(context context.Context) (R, error)
	DataAccessCall[R any]   func(context context.Context, dataAccess domain.DataAccess) (R, error)
	ParamCall[P, R any]     func(context context.Context, dataAccess domain.DataAccess, parameter P) (R, error)
	LoginCall[P, R any]     func(context context.Context, dataAccess domain.DataAccess, tokenGeneration domain.TokensProduct, parameter P) (R, error)
	RefreshCall             func(context context.Context, dataAccess domain.DataAccess, tokenGeneration domain.TokensProduct, user domain.ConnectedUser) (*domain.LoggedUser, error)
)

// AsNoDataAccessCall englobe l'appel à la fonction dans un appel plus générique
func AsNoDataAccessCall[R any](callback NoDataAccessCall[R]) responseRequestCall {
	return Wrapper[R]{}.forNoAccessCall(callback).wrap()
}

// AsDataAccessCall englobe dans des fonctions imbriqués l'appel à la fonction (démarrage et l'arrêt bdd, conversion de la réponse)
func AsDataAccessCall[R any](callback DataAccessCall[R], dataAccessProvider domain.DataAccessProvider) responseRequestCall {
	return Wrapper[R]{}.forDataAccessCall(callback).withDataAccessProvider(dataAccessProvider).wrap()
}

// AsParamDataAccessCall englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse)
func AsParamDataAccessCall[P, R any](callback ParamCall[P, R], dataAccessProvider domain.DataAccessProvider) responseRequestCall {
	return ParamWrapper[P, R]{}.forParamCall(callback).withDataAccessProvider(dataAccessProvider).wrap()
}

// AsLoginCall englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse) pour la connexion ou la création du compte avec connexion
func AsLoginCall[P, R any](callback LoginCall[P, R], dataAccessProvider domain.DataAccessProvider) responseRequestCall {
	return ParamWrapper[P, R]{}.forLoginCall(callback).withDataAccessProvider(dataAccessProvider).wrap()
}

// AsRefreshCall englobe dans des fonctions imbriqués l'appel à la fonction (bdd, conversion réponse) pour le rafraîchissement de l'authentification à partir du jeton dédié
func AsRefreshCall(callback RefreshCall, dataAccessProvider domain.DataAccessProvider) responseRequestCall {
	return Wrapper[*domain.LoggedUser]{}.forRefreshCall(callback).withDataAccessProvider(dataAccessProvider).wrap()
}
