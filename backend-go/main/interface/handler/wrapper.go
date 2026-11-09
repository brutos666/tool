package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"goTool/domain"
	"goTool/domain/domainMessage"
	"goTool/generic"
	"goTool/interface/handler/authentication"
	"goTool/interface/mapper"
)

const (
	DATA_ACCESS_PANIC   = "L'appel exige un accès à des données (base de données)"
	PARAM_CONVERT_PANIC = "Problème de conversion du paramètre de la requête vers l'entité du domain"
	FORM_FILE_NAME      = "fileToUpload"
	BAD_FILE            = "Le fichier '" + FORM_FILE_NAME + "' n'est pas fourni ou n'est pas un fichier"
	INVALID_FILE        = "Formulaire invalide"
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
		return callback(ctx, callContext.GetDataAccessId(), domainParameter)
	}
	w.requestCall = wrapRequestParameter(w.parameterCall)
	return w
}

func (w ParamWrapper[P, R]) forLoginCall(callback LoginCall[P, R]) ParamWrapper[P, R] {
	w.parameterCall = func(ctx context.Context, callContext CallContext, domainParameter P) (any, error) {
		return callback(ctx, callContext.GetDataAccessId(), callContext.GetTokenGenerator(), domainParameter)
	}
	w.requestCall = wrapRequestParameter(w.parameterCall)
	return w
}

type Wrapper[R any] struct {
	requestCall       requestCall
	dataAccessService generic.DataAccessService
	accessType        string
}

func (w Wrapper[R]) forNoAccessCall(callback NoDataAccessCall[R]) Wrapper[R] {
	w.requestCall = func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx)
	}
	return w
}

func (w Wrapper[R]) forDataAccessCall(callback DataAccessCall[R]) Wrapper[R] {
	w.requestCall = func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.GetDataAccessId())
	}
	return w
}

func (w Wrapper[R]) forRefreshCall(callback RefreshCall) Wrapper[R] {
	w.requestCall = func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		return callback(ctx, callContext.GetDataAccessId(), callContext.GetTokenGenerator(), *callContext.GetConnectedUser())
	}
	return w
}

func (w Wrapper[R]) forFileParamCall(callback FileParamCall[R]) Wrapper[R] {
	fileCall := func(ctx context.Context, callContext CallContext, fileReader io.Reader) (any, error) {
		return callback(ctx, fileReader)
	}
	w.requestCall = wrapRequestFileParameter(fileCall)
	return w
}

func (w Wrapper[R]) withDataAccessService(dataAccessService generic.DataAccessService, accessType string) Wrapper[R] {
	if dataAccessService == nil {
		panic(DATA_ACCESS_PANIC)
	}
	w.dataAccessService = dataAccessService
	w.accessType = accessType
	return w
}

func (w Wrapper[R]) wrap() responseRequestCall {
	if w.dataAccessService != nil || w.accessType != "" {
		w.requestCall = wrapDataAccess(w.requestCall, w.dataAccessService, w.accessType)
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

func wrapRequestFileParameter(wrappedCall parameterCall[io.Reader]) requestCall {
	return func(ctx context.Context, callContext CallContext, request *http.Request) (any, error) {
		if !strings.HasPrefix(request.Header.Get("Content-Type"), "multipart/form-data") {
			return nil, domainMessage.NewError(INVALID_FILE)
		}
		reader, err := request.MultipartReader()
		if err != nil {
			return nil, domainMessage.NewError(INVALID_FILE)
		}
		fileReader, err := getFileReader(reader)
		if err != nil {
			return nil, err
		}
		return wrappedCall(ctx, callContext, fileReader)
	}
}

func getFileReader(reader *multipart.Reader) (io.Reader, error) {
	for {
		part, err := reader.NextPart()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			if isTooBigError(err) {
				return nil, domainMessage.NewError(FILE_TOO_BIG)
			}
			return nil, domainMessage.NewError(INVALID_FILE)
		}
		if part.FormName() != FORM_FILE_NAME || part.FileName() == "" {
			continue // pas le fichier attendu
		}
		return part, nil
	}
	return nil, domainMessage.NewError(BAD_FILE)
}

func isTooBigError(err error) bool {
	var mbe *http.MaxBytesError
	return errors.As(err, &mbe)
}

func wrapDataAccess(wrappedCall requestCall, dataAccessService generic.DataAccessService, accessType string) requestCall {
	return func(ctx context.Context, callContext CallContext, request *http.Request) (values any, err error) {
		accessId, err := dataAccessService.OpenAccess(accessType)
		if err != nil {
			return nil, err
		}
		defer func() { err = dataAccessService.CloseAccess(accessId, err) }()

		callContext.AddDataAccessId(accessId)
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

		tokenGenerator := callContext.GetTokenGenerator()
		authentication.SendRefreshTokenCookie(response, tokenGenerator.GetRefreshToken())
		loggedWebResult := mapper.ConvertLoggedUserToWebResult(loggedUser.(*domain.LoggedUser))
		loggedWebResult.SetToken(tokenGenerator.GetAccessToken())

		sendOkResponse(response, requestPath, loggedWebResult)
	}
}
