package call

import (
	"context"
	"encoding/json"
	"net/http"

	"goTool/domain"
	"goTool/interface/webResult"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

const (
	INCORRECT_FUNCTION   string = "La méthode est incorrecte. Elle doit avec le contexte en 1er paramètre suivi éventuellement de l'utilisateur connecté et/ou d'un paramètre"
	WITH_ONLY_RESULT     int    = 0
	WITH_USER            int    = 1
	WITH_PARAM           int    = 2
	WITH_USER_WITH_PARAM int    = 3
)

type Callback interface {
	call(args ...any) (any, error)
	getType() int
	getParameterInstance() any
}

type Call[R any] struct {
	Callback func(context.Context) (R, error)
}

func (call Call[R]) call(args ...any) (any, error) {
	return call.Callback(args[0].(context.Context))
}
func (call Call[R]) getType() int              { return WITH_ONLY_RESULT }
func (call Call[R]) getParameterInstance() any { return nil }

type CallUser[R any] struct {
	Callback func(context.Context, domain.ConnectedUser) (R, error)
}

func (call CallUser[R]) call(args ...any) (any, error) {
	return call.Callback(args[0].(context.Context), args[1].(domain.ConnectedUser))
}
func (call CallUser[R]) getType() int              { return WITH_USER }
func (call CallUser[R]) getParameterInstance() any { return nil }

type CallUserParam[P, R any] struct {
	Callback          func(context.Context, domain.ConnectedUser, P) (R, error)
	parameterInstance any
}

func (call CallUserParam[P, R]) call(args ...any) (any, error) {
	return call.Callback(args[0].(context.Context), args[1].(domain.ConnectedUser), args[2].(P))
}
func (call CallUserParam[P, R]) getType() int              { return WITH_USER_WITH_PARAM }
func (call CallUserParam[P, R]) getParameterInstance() any { return call.parameterInstance }

// CallParam Pour les requêtes http fournissant un paramètre en entrée, don le traitement n'a pas besoin de connaître l'utilisateur connecté
type CallParam[P, R any] struct {
	Callback          func(context.Context, P) (R, error)
	parameterInstance any
}

func (call CallParam[P, R]) call(args ...any) (any, error) {
	return call.Callback(args[0].(context.Context), args[1].(P))
}
func (call CallParam[P, R]) getType() int              { return WITH_PARAM }
func (call CallParam[P, R]) getParameterInstance() any { return call.parameterInstance }

// Get - Appel qui retourne un résultat et une erreur
func Get[R any](callback func(context.Context) (R, error)) Call[R] {
	return Call[R]{Callback: callback}
}

// WithUser - Appel avec l'utilisateur connecté qui retourne un résultat et une erreur
func WithUser[R any](callback func(context.Context, domain.ConnectedUser) (R, error)) CallUser[R] {
	return CallUser[R]{Callback: callback}
}

// WithUserWithParam - Appel avec un paramètre en entrée et l'utilisateur connecté qui retourne un résultat et une erreur
func WithUserWithParam[P, R any](callback func(context.Context, domain.ConnectedUser, P) (R, error)) CallUserParam[P, R] {
	return CallUserParam[P, R]{Callback: callback, parameterInstance: *new(P)}
}

// WithParam - Appel avec un paramètre en entrée qui retourne un résultat et une erreur
func WithParam[P, R any](callback func(context.Context, P) (R, error)) CallParam[P, R] {
	return CallParam[P, R]{Callback: callback, parameterInstance: *new(P)}
}

type (
	WrappedCall func(ctx context.Context, user *domain.ConnectedUser, request *http.Request) (any, error)
)

func WrapCallback(callback Callback) WrappedCall {
	switch callback.getType() {
	case WITH_ONLY_RESULT:
		return func(ctx context.Context, user *domain.ConnectedUser, request *http.Request) (any, error) {
			return callback.call(ctx)
		}
	case WITH_USER:
		return func(ctx context.Context, user *domain.ConnectedUser, request *http.Request) (any, error) {
			return callback.call(ctx, user)
		}
	case WITH_PARAM:
		return func(ctx context.Context, user *domain.ConnectedUser, request *http.Request) (any, error) {
			parameterType := callback.getParameterInstance()
			parameter, err := readRequestParameter(request, parameterType)
			if err != nil {
				return nil, err
			}
			return callback.call(ctx, parameter)
		}
	case WITH_USER_WITH_PARAM:
		return func(ctx context.Context, user *domain.ConnectedUser, request *http.Request) (any, error) {
			parameterType := callback.getParameterInstance()
			parameter, err := readRequestParameter(request, parameterType)
			if err != nil {
				return nil, err
			}
			return callback.call(ctx, user, parameter)
		}
	default:
		panic(INCORRECT_FUNCTION)
	}
}

func readRequestParameter(request *http.Request, parameter any) (any, error) {
	webParameter := webResult.GetInstance(parameter)
	err := json.NewDecoder(request.Body).Decode(&webParameter)
	if err != nil {
		return parameter, err
	}
	if validationErr := validate.Struct(webParameter); validationErr != nil {
		return parameter, validationErr
	}
	return webResult.ConvertToEntity(webParameter), nil
}
