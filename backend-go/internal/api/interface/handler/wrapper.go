package handler

import (
	"bytes"
	"context"
	"net/http"
	"time"

	"goTool/internal/api/interface/handler/authentication"
	"goTool/internal/api/interface/mapper"
)

const (
	DATA_ACCESS_PANIC   = "L'appel exige un accès à des données (base de données)"
	PARAM_CONVERT_PANIC = "Problème de conversion du paramètre de la requête vers l'entité du domain"
	FORM_FILE_NAME      = "fileToUpload"
	BAD_FILE            = "Le fichier '" + FORM_FILE_NAME + "' n'est pas fourni ou n'est pas un fichier"
	INVALID_FILE        = "Formulaire invalide"
)

type (
	respReqErrorCall func(context context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (values any, err error)
)

type Wrap[P, R any] struct {
	call respReqErrorCall
}

func (w Wrap[P, R]) callService(callback any) Wrap[P, R] {
	var parameterType P
	var responseType R
	call := GetCall[P, R](callback, parameterType)
	responseMapper := mapper.GetResponseMapper(responseType)

	w.call = func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (any, error) {
		values, err := call(ctx, callContext, response, request)
		if err != nil {
			return nil, err
		}
		if values != nil {
			return responseMapper.ConvertToWebResult(values), nil
		}
		return nil, nil
	}
	return w
}

func (w Wrap[P, R]) addDataAccess(accessType string) Wrap[P, R] {
	call := w.call

	w.call = func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) (values any, err error) {
		accessId, err := dataAccessService.OpenAccess(accessType)
		if err != nil {
			return nil, err
		}
		defer func() { err = dataAccessService.CloseAccess(accessId, err) }()
		callContext.AddDataAccessId(accessId)
		return call(ctx, callContext, response, request)
	}
	return w
}

/** build **/
func (w Wrap[P, R]) build() responseRequestCall {
	call := w.call
	return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		values, err := call(ctx, callContext, response, request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}
		if values != nil {
			sendJsonResponse(response, requestPath, values)
		}
	}
}

func (w Wrap[P, R]) loginBuild() responseRequestCall {
	call := w.call
	return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		loggedWebResult, err := call(ctx, callContext, response, request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}

		tokenGenerator := callContext.GetTokenGenerator()
		authentication.SendRefreshTokenCookie(response, tokenGenerator.GetRefreshToken())
		loggedWebResult.(*mapper.LoggedUserWebResult).SetToken(tokenGenerator.GetAccessToken())

		sendJsonResponse(response, requestPath, loggedWebResult)
	}
}

func (w Wrap[P, R]) fileBuild() responseRequestCall {
	call := w.call
	return func(ctx context.Context, callContext CallContext, response http.ResponseWriter, request *http.Request) {
		requestPath := request.URL.Path
		buffer, err := call(ctx, callContext, response, request)
		if err != nil {
			sendError(response, requestPath, err)
			return
		}
		// Transforme la date du jour au format "YYYY-MM-DD"
		now := time.Now().UTC().Format(time.DateOnly)
		fileName := "toolTache" + now
		sendCsvResponse(response, requestPath, buffer.(*bytes.Buffer), fileName)
	}
}
