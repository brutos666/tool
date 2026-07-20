package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"goTool/domain"
	"goTool/interface/handler/authentication"
	"goTool/interface/mapper"
	"goTool/utilities"

	"github.com/go-playground/validator/v10"
)

const DATA_ACCESS_ERROR = "L'appel exige un accès à des données"

var validate = validator.New()

type (
	OnlyContextCall[R any]      func(context context.Context) (R, error)
	BasicCall[R any]            func(context context.Context, dataAccess domain.DataAccess) (R, error)
	CallWithParam[P, R any]     func(context context.Context, dataAccess domain.DataAccess, parameter P) (R, error)
	LoginCall[P, R any]         func(context context.Context, dataAccess domain.DataAccess, tokenGeneration domain.TokensProduct, parameter P) (R, error)
	RefreshCall                 func(context context.Context, dataAccess domain.DataAccess, tokenGeneration domain.TokensProduct, user domain.ConnectedUser) (*domain.LoggedUser, error)
	wrappedCall                 func(context context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request)
	wrappedCall2                func(context context.Context, callContext CallContext, request *http.Request) (values any, err error)
	WrappedCallWithParam[P any] func(context context.Context, callContext CallContext, parameter P) (values any, err error)
)

// AsContextCall englobe l'appel à la fonction dans un appel plus générique
func AsContextCall[R any](callback OnlyContextCall[R]) wrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx)
	}
	return wrapResponse[R](wrappedCall)
}

// AsBasicCall englobe dans des fonctions imbriqués l'appel à la fonction (démarrage et l'arrêt bdd, conversion de la réponse)
func AsBasicCall[R any](callback BasicCall[R]) wrappedCall {
	wrappedCall := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.dataAccess)
	}
	wrappedCall = wrapWithDataAccess(wrappedCall)
	return wrapResponse[R](wrappedCall)
}

// AsCallWithParam englobe dans des fonctions imbriqués l'appel à la fonction (passage du paramètre de la requête, bdd, conversion réponse)
func AsCallWithParam[P, R any](callback CallWithParam[P, R]) wrappedCall {
	call := func(ctx context.Context, callContext CallContext, domainParameter P) (any, error) {
		return callback(ctx, callContext.dataAccess, domainParameter)
	}
	wrappedCall := wrapRequestParameter(call)
	wrappedCall = wrapWithDataAccess(wrappedCall)
	return wrapResponse[R](wrappedCall)
}

func AsLoginCall[P, R any](callback LoginCall[P, R]) wrappedCall {
	call := func(ctx context.Context, callContext CallContext, domainParameter P) (any, error) {
		return callback(ctx, callContext.dataAccess, callContext.tokenGenerator, domainParameter)
	}
	wrappedCall := wrapRequestParameter(call)
	wrappedCall = wrapWithDataAccess(wrappedCall)
	return wrapLoginResponse(wrappedCall)
}

func AsRefreshCall(callback RefreshCall) wrappedCall {
	call := func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.dataAccess, callContext.tokenGenerator, *callContext.user)
	}
	wrappedCall := wrapWithDataAccess(call)
	return wrapLoginResponse(wrappedCall)
}

func wrapRequestParameter[P any](wrappedCall WrappedCallWithParam[P]) wrappedCall2 {
	var domainParameter P
	mapper := mapper.GetRequestMapper[P](domainParameter)

	return func(ctx context.Context, callContext CallContext, request *http.Request) (values any, err error) {
		webParameter := mapper.GetWebResultInstance()
		err = json.NewDecoder(request.Body).Decode(&webParameter)
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

		values, err = wrappedCall(ctx, callContext, *domainParameter)
		return
	}
}

func wrapResponse[R any](wrappedCall wrappedCall2) wrappedCall {
	var result R
	mapper := mapper.GetResponseMapper(result)

	return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		values, err := wrappedCall(ctx, callContext, request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}
		sendOkResponse(response, requestPath, mapper.ConvertToWebResult(values))
	}
}

func wrapLoginResponse(wrappedCall wrappedCall2) wrappedCall {
	return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		loggedUser, err := wrappedCall(ctx, callContext, request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}

		tokenGenerator := callContext.tokenGenerator.(*authentication.TokensGenerator)
		authentication.SendRefreshTokenCookie(response, tokenGenerator.GetRefreshToken())
		loggedWebResult := mapper.ConvertLoggedUserToWebResult(loggedUser.(*domain.LoggedUser))
		loggedWebResult.SetToken(tokenGenerator.GetAccessToken())

		sendOkResponse(response, requestPath, loggedWebResult)
	}
}

func wrapWithDataAccess(wrappedCall wrappedCall2) wrappedCall2 {
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
