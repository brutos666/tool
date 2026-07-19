// Package call construit une fonction qui s'occupe de l'appel à une fonction en lui passant les paramètres dont elle a besoin selon son type, du démarrage et de l'arrêt du système d'accès aux données
package call

import (
	"context"
	"encoding/json"
	"net/http"

	"goTool/domain"
	"goTool/interface/webResult"
	"goTool/utilities"

	"github.com/go-playground/validator/v10"
)

const DATA_ACCESS_ERROR = "L'appel exige un accès à des données"

var validate = validator.New()

type (
	OnlyContextCall[R any]  func(context context.Context) (R, error)
	BasicCall[R any]        func(context context.Context, dataAccess domain.DataAccess) (R, error)
	CallWithParam[P, R any] func(context context.Context, dataAccess domain.DataAccess, parameter P) (R, error)
	LoginCall[P, R any]     func(context context.Context, dataAccess domain.DataAccess, tokenGeneration domain.TokensProduct, parameter P) (R, error)
	RefreshCall             func(context context.Context, dataAccess domain.DataAccess, tokenGeneration domain.TokensProduct, user domain.ConnectedUser) (*domain.LoggedUser, error)
	WrappedCall             func(context context.Context, callContext CallContext, request *http.Request) (values any, err error)
)

// AsContextCall englobe l'appel à la fonction dans un appel plus générique
func AsContextCall[R any](callback OnlyContextCall[R]) WrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx)
	}
	return wrappedCall
}

// AsBasicCall englobe dans des fonctions imbriqués l'appel à la fonction ainsi que le démarrage et l'arrêt de l'accès aux données
func AsBasicCall[R any](callback BasicCall[R]) WrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.dataAccess)
	}
	return wrapWithDataAccess(wrappedCall)
}

// AsCallWithParam englobe dans des fonctions imbriqués l'appel à la fonction avec passage du paramètre de la requête ainsi que le démarrage et l'arrêt de l'accès aux données
func AsCallWithParam[P, R any](callback CallWithParam[P, R]) WrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		parameter, err := readRequestParameter[P](request)
		if err != nil {
			return nil, err
		}
		return callback(ctx, callContext.dataAccess, *parameter)
	}
	return wrapWithDataAccess(wrappedCall)
}

func AsLoginCall[P, R any](callback LoginCall[P, R]) WrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		parameter, err := readRequestParameter[P](request)
		if err != nil {
			return nil, err
		}
		return callback(ctx, callContext.dataAccess, callContext.tokenGenerator, *parameter)
	}
	return wrapWithDataAccess(wrappedCall)
}

func AsRefreshCall(callback RefreshCall) WrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.dataAccess, callContext.tokenGenerator, *callContext.user)
	}
	return wrapWithDataAccess(wrappedCall)
}

func wrapWithDataAccess(wrappedCall WrappedCall) WrappedCall {
	return func(ctx context.Context, callContext CallContext, request *http.Request) (values any, err error) {
		dataAccess := callContext.dataAccess
		if dataAccess == nil {
			panic(DATA_ACCESS_ERROR)
		}
		err = dataAccess.Open()
		if err != nil {
			return nil, err
		}
		defer func() {
			if err != nil {
				err = utilities.JoinErrors(err, dataAccess.Cancel())
			}
		}()
		defer func() {
			err = utilities.JoinErrors(err, dataAccess.Close())
		}()
		values, err = wrappedCall(ctx, callContext, request)
		return
	}
}

func readRequestParam(request *http.Request, parameterP any) (any, error) {
	webParameter := webResult.GetInstance(parameterP)
	err := json.NewDecoder(request.Body).Decode(&webParameter)
	if err != nil {
		return nil, err
	}
	if validationErr := validate.Struct(webParameter); validationErr != nil {
		return nil, validationErr
	}
	return webResult.ConvertToEntity(webParameter), nil
}

func readRequestParameter[P any](request *http.Request) (*P, error) {
	parameter := new(P)
	requestParameter := webResult.GetInstance(parameter)
	err := json.NewDecoder(request.Body).Decode(requestParameter)
	if err != nil {
		return nil, err
	}
	if validationErr := validate.Struct(requestParameter); validationErr != nil {
		return nil, validationErr
	}
	entity := webResult.ConvertToEntity(requestParameter)
	parameter, ok := entity.(*P)
	if !ok {
		panic("Conversion incorrect du paramètre de la requête")
	}
	return parameter, nil
}
