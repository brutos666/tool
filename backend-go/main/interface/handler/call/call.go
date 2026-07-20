// Package call construit une fonction qui s'occupe de l'appel à une fonction en lui passant les paramètres dont elle a besoin selon son type, du démarrage et de l'arrêt du système d'accès aux données
package call

import (
	"context"
	"encoding/json"
	"net/http"

	"goTool/domain"
	"goTool/interface/mapper"
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
	var result R
	mapper := mapper.GetMapper[int](0, result)
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		domainResult, err := callback(ctx)
		if err != nil {
			return nil, err
		}
		return mapper.ConvertToWebResult(domainResult), nil
	}
	return wrappedCall
}

// AsBasicCall englobe dans des fonctions imbriqués l'appel à la fonction ainsi que le démarrage et l'arrêt de l'accès aux données
func AsBasicCall[R any](callback BasicCall[R]) WrappedCall {
	var result R
	mapper := mapper.GetMapper[int](0, result)
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		domainResult, err := callback(ctx, callContext.dataAccess)
		if err != nil {
			return nil, err
		}
		return mapper.ConvertToWebResult(domainResult), nil
	}
	return wrapWithDataAccess(wrappedCall)
}

// AsCallWithParam englobe dans des fonctions imbriqués l'appel à la fonction avec passage du paramètre de la requête ainsi que le démarrage et l'arrêt de l'accès aux données
func AsCallWithParam[P, R any](callback CallWithParam[P, R]) WrappedCall {
	var parameter P
	var result R
	mapper := mapper.GetMapper[P](parameter, result)

	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		domainParameter, err := readRequestParameter[P](request, mapper)
		if err != nil {
			return nil, err
		}
		domainResult, err := callback(ctx, callContext.dataAccess, *domainParameter)
		if err != nil {
			return nil, err
		}
		return mapper.ConvertToWebResult(domainResult), nil
	}
	return wrapWithDataAccess(wrappedCall)
}

func AsLoginCall[P, R any](callback LoginCall[P, R]) WrappedCall {
	var parameter P
	var result R
	mapper := mapper.GetMapper[P](parameter, result)

	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		domainParameter, err := readRequestParameter[P](request, mapper)
		if err != nil {
			return nil, err
		}
		domainResult, err := callback(ctx, callContext.dataAccess, callContext.tokenGenerator, *domainParameter)
		if err != nil {
			return nil, err
		}
		return mapper.ConvertToWebResult(domainResult), nil
	}
	return wrapWithDataAccess(wrappedCall)
}

func AsRefreshCall(callback RefreshCall) WrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		domainResult, err := callback(ctx, callContext.dataAccess, callContext.tokenGenerator, *callContext.user)
		if err != nil {
			return nil, err
		}
		return mapper.ConvertLoggedUserToWebResult(domainResult), nil
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

func readRequestParameter[P any](request *http.Request, mapper mapper.Mapper) (*P, error) {
	webParameter := mapper.GetWebResultInstance()
	err := json.NewDecoder(request.Body).Decode(&webParameter)
	if err != nil {
		return nil, err
	}
	if validationErr := validate.Struct(webParameter); validationErr != nil {
		return nil, validationErr
	}
	domainParameter, ok := mapper.ConvertToDomain(webParameter).(*P)
	if !ok {
		panic("Problème de conversion du paramètre de la requête vers l'entité du domain")
	}
	return domainParameter, nil
}
