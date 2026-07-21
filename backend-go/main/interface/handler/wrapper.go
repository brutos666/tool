package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"goTool/domain"
	"goTool/interface/handler/authentication"
	"goTool/interface/mapper"
	"goTool/utilities"
)

const (
	DATA_ACCESS_PANIC   = "L'appel exige un accès à des données (base de données)"
	PARAM_CONVERT_PANIC = "Problème de conversion du paramètre de la requête vers l'entité du domain"
)

type (
	responseRequestCall  func(context context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request)
	requestCall          func(context context.Context, callContext CallContext, request *http.Request) (values any, err error)
	parameterCall[P any] func(context context.Context, callContext CallContext, parameter P) (values any, err error)
)

type ParamWrapper[P, R any] struct {
	parameterCall parameterCall[P]
	Wrapper[R]
}

func (w ParamWrapper[P, R]) forParamCall(callback ParamCall[P, R]) ParamWrapper[P, R] {
	w.parameterCall = func(ctx context.Context, callContext CallContext, domainParameter P) (any, error) {
		return callback(ctx, callContext.dataAccess, domainParameter)
	}
	w.requestCall = wrapRequestParameter(w.parameterCall)
	return w
}

func (w ParamWrapper[P, R]) forLoginCall(callback LoginCall[P, R]) ParamWrapper[P, R] {
	w.parameterCall = func(ctx context.Context, callContext CallContext, domainParameter P) (any, error) {
		return callback(ctx, callContext.dataAccess, callContext.tokenGenerator, domainParameter)
	}
	w.requestCall = wrapRequestParameter(w.parameterCall)
	return w
}

type Wrapper[R any] struct {
	requestCall        requestCall
	dataAccessProvider domain.DataAccessProvider
	needDataAccess     bool
}

func (w Wrapper[R]) forNoAccessCall(callback NoDataAccessCall[R]) Wrapper[R] {
	w.requestCall = func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx)
	}
	return w
}

func (w Wrapper[R]) forDataAccessCall(callback DataAccessCall[R]) Wrapper[R] {
	w.requestCall = func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.dataAccess)
	}
	w.needDataAccess = true
	return w
}

func (w Wrapper[R]) forRefreshCall(callback RefreshCall) Wrapper[R] {
	w.requestCall = func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.dataAccess, callContext.tokenGenerator, *callContext.user)
	}
	w.needDataAccess = true
	return w
}

func (w Wrapper[R]) withDataAccessProvider(dataAccessProvider domain.DataAccessProvider) Wrapper[R] {
	w.dataAccessProvider = dataAccessProvider
	return w
}

func (w Wrapper[R]) wrap() responseRequestCall {
	if w.needDataAccess {
		w.requestCall = wrapDataAccess(w.requestCall, w.dataAccessProvider)
	}
	return wrapResponse[R](w.requestCall)
}

func wrapRequestParameter[P any](wrappedCall parameterCall[P]) requestCall {
	var domainParameter P
	requestMapper := mapper.GetRequestMapper[P](domainParameter)

	return func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		webParameter := requestMapper.GetWebResultInstance()
		err := json.NewDecoder(request.Body).Decode(&webParameter)
		if err != nil {
			return nil, err
		}
		if validationErr := validate.Struct(webParameter); validationErr != nil {
			return nil, validationErr
		}
		domainParameter, ok := requestMapper.ConvertToDomain(webParameter).(*P)
		if !ok {
			panic(PARAM_CONVERT_PANIC)
		}
		return wrappedCall(ctx, callContext, *domainParameter)
	}
}

func wrapDataAccess(wrappedCall requestCall, dataAccessProvider domain.DataAccessProvider) requestCall {
	return func(ctx context.Context, callContext CallContext, request *http.Request) (values any, err error) {
		dataAccess := dataAccessProvider.GetInstance()
		if dataAccess == nil {
			panic(DATA_ACCESS_PANIC)
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
		callContext.AddDataAccess(dataAccess)
		values, err = wrappedCall(ctx, callContext, request)
		return
	}
}

func wrapResponse[R any](wrappedCall requestCall) responseRequestCall {
	var result R
	responseMapper := mapper.GetResponseMapper(result)
	// Cas particulier lorsque l'utilisateur est en train de s'authentifier
	if responseMapper.IsLoginResponse() {
		return wrapLoginResponse(wrappedCall)
	}

	return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		values, err := wrappedCall(ctx, callContext, request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}
		sendOkResponse(response, requestPath, responseMapper.ConvertToWebResult(values))
	}
}

func wrapLoginResponse(wrappedCall requestCall) responseRequestCall {
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
