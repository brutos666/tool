package handler

import (
	"bytes"
	"context"
	"io"
	"net/http"

	"goTool/internal/api/domain"
	"goTool/internal/api/domain/domainMessage"
	"goTool/internal/api/interface/mapper"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// Répertorie tous les appels possibles côté application
type (
	NoDataAccessCall[R any] func(context context.Context) (R, error)
	DataAccessCall[R any]   func(context context.Context, dataAccessId int) (R, error)
	ParamCall[P, R any]     func(context context.Context, dataAccessId int, parameter P) (R, error)
	FileParamCall[R any]    func(context context.Context, reader io.Reader) (R, error)
	FileConvertCall[P any]  func(context context.Context, parameter P) (*bytes.Buffer, error)
	LoginCall[P, R any]     func(context context.Context, dataAccessId int, tokenGeneration domain.TokensProduct, parameter P) (R, error)
	RefreshCall             func(context context.Context, dataAccessId int, tokenGeneration domain.TokensProduct, user domain.ConnectedUser) (*domain.LoggedUser, error)

	responseRequestCall func(context context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request)
	Call                func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error)
)

func GetCall[P, R any](serviceCall any, parameterType P) Call {
	requestMapper := mapper.GetRequestMapper[P](parameterType)

	switch call := serviceCall.(type) {
	case NoDataAccessCall[R]:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			return call(ctx)
		}
	case DataAccessCall[R]:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			return call(ctx, callContext.GetDataAccessId())
		}
	case ParamCall[P, R]:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			parameter, err := getJsonParameter[P](requestMapper, request)
			if err != nil {
				return nil, err
			}
			return call(ctx, callContext.GetDataAccessId(), *parameter)
		}
	case LoginCall[P, R]:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			parameter, err := getJsonParameter[P](requestMapper, request)
			if err != nil {
				return nil, err
			}
			return call(ctx, callContext.GetDataAccessId(), callContext.GetTokenGenerator(), *parameter)
		}
	case RefreshCall:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			return call(ctx, callContext.GetDataAccessId(), callContext.GetTokenGenerator(), *callContext.GetConnectedUser())
		}
	case FileConvertCall[P]:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			parameter, err := getJsonParameter[P](requestMapper, request)
			if err != nil {
				return nil, err
			}
			return call(ctx, *parameter)
		}
	case FileParamCall[R]:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			reader, err := getFileParameter(request)
			if err != nil {
				return nil, err
			}
			return call(ctx, reader)
		}
	default:
		return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
			return nil, domainMessage.Errorf("La forme de la méthode du service %s n'est pas définie dans la liste", serviceCall)
		}
	}
}

// AsNoDataAccessCall englobe l'appel à la fonction dans un appel plus générique
func AsNoDataAccessCall[R any](callback NoDataAccessCall[R]) responseRequestCall {
	return Wrap[any, R]{}.callService(callback).build()
}

// AsDataAccessCall englobe dans des fonctions imbriqués l'appel à la fonction (démarrage et l'arrêt bdd, conversion de la réponse)
func AsDataAccessCall[R any](callback DataAccessCall[R], accessType string) responseRequestCall {
	return Wrap[any, R]{}.callService(callback).addDataAccess(accessType).build()
}

// AsParamDataAccessCall englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse)
func AsParamDataAccessCall[P, R any](callback ParamCall[P, R], accessType string) responseRequestCall {
	return Wrap[P, R]{}.callService(callback).addDataAccess(accessType).build()
}

// AsLoginCall englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse) pour la connexion ou la création du compte avec connexion
func AsLoginCall[P, R any](callback LoginCall[P, R], accessType string) responseRequestCall {
	return Wrap[P, R]{}.callService(callback).addDataAccess(accessType).loginBuild()
}

// AsRefreshCall englobe dans des fonctions imbriqués l'appel à la fonction (bdd, conversion réponse) pour le rafraîchissement de l'authentification à partir du jeton dédié
func AsRefreshCall(callback RefreshCall, accessType string) responseRequestCall {
	return Wrap[any, *domain.LoggedUser]{}.callService(callback).addDataAccess(accessType).loginBuild()
}

func AsFileParamCall[R any](callback FileParamCall[R]) responseRequestCall {
	return Wrap[any, R]{}.callService(callback).build()
}

func AsConvertFileCall[P any](callback FileConvertCall[P]) responseRequestCall {
	return Wrap[P, any]{}.callService(callback).fileBuild()
}
