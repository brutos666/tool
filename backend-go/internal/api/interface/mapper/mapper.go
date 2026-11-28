// Package mapper s'occupe des conversions entre le domain et l'interface et inversement
package mapper

import (
	"net/http"

	"goTool/internal/api/domain"
	"goTool/internal/api/domain/domainMessage"
	"goTool/internal/api/interface/handler/responseMessage"
)

type (
	CanBeConvert[D any] interface {
		ConvertToDomain() *D
	}
)

type IdealMapper[D any, W CanBeConvert[D]] struct{}

func (mapper IdealMapper[D, W]) GetInstance() *W                { return new(W) }
func (mapper IdealMapper[D, W]) ConvertToDomain(webResult W) *D { return webResult.ConvertToDomain() }

type ResponseMapper struct {
	ConvertToWebResult func(domain any) any
	login              bool
}

func (mapper ResponseMapper) IsLoginResponse() bool { return mapper.login }

type RequestMapper struct {
	GetWebResultInstance func() any
	ConvertToDomain      func(requestParam any) any
}

func GetRequestMapper[I any](input any) RequestMapper {
	var getWebResultCall func() any
	var convertToDomainCall func(requestParam any) any

	switch input.(type) {
	case domain.File:
		getWebResultCall = func() any { return new(FileWebResult) }
		convertToDomainCall = func(requestParam any) any { return requestParam.(*FileWebResult).ConvertToDomain() }
	case domain.NodeSpace:
		getWebResultCall = func() any { return new(NodeSpaceWebResult) }
		convertToDomainCall = func(requestParam any) any { return requestParam.(*NodeSpaceWebResult).ConvertToDomain() }
	case domain.User:
		getWebResultCall = func() any { return new(RegisterUserWebResult) }
		convertToDomainCall = func(requestParam any) any { return requestParam.(*RegisterUserWebResult).ConvertToDomain() }
	case domain.LoginUser:
		getWebResultCall = func() any { return new(LoginUserWebResult) }
		convertToDomainCall = func(requestParam any) any { return requestParam.(*LoginUserWebResult).ConvertToDomain() }
	default:
		// La forme de l'objet envoyé par le navigateur et l'objet utilisé par le serveur est la même et on ne souhaite pas faire de transformation (coûteuse et inutile)
		getWebResultCall = func() any { return new(I) }
		convertToDomainCall = func(requestParam any) any { return requestParam }
	}
	return RequestMapper{GetWebResultInstance: getWebResultCall, ConvertToDomain: convertToDomainCall}
}

func GetResponseMapper(output any) ResponseMapper {
	var convertToWebResult func(domain any) any
	forLogin := false

	switch output.(type) {
	case *domain.NodeSpace:
		convertToWebResult = func(domainParam any) any { return ConvertNodeSpaceToWebResult(domainParam.(*domain.NodeSpace)) }
	case *domain.Space:
		convertToWebResult = func(domainParam any) any { return ConvertSpaceToWebResult(domainParam.(*domain.Space)) }
	case []*domain.Space:
		convertToWebResult = func(domainParam any) any { return ConvertSpacesToWebResult(domainParam.([]*domain.Space)) }
	case *domain.LoggedUser:
		convertToWebResult = func(domainParam any) any { return ConvertLoggedUserToWebResult(domainParam.(*domain.LoggedUser)) }
		forLogin = true
	case *domain.User:
		convertToWebResult = func(domainParam any) any { return ConvertUserToWebResult(domainParam.(*domain.User)) }
	case []*domain.User:
		convertToWebResult = func(domainParam any) any { return ConvertUsersToWebResult(domainParam.([]*domain.User)) }
	case []*domain.File:
		convertToWebResult = func(domainParam any) any { return ConvertFilesToWebResult(domainParam.([]*domain.File)) }
	case *domain.File:
		convertToWebResult = func(domainParam any) any { return ConvertFileToWebResult(domainParam.(*domain.File)) }
	case *responseMessage.Message:
		convertToWebResult = func(domainParam any) any {
			return ConvertHttpMessageToWebResult(domainParam.(*responseMessage.Message))
		}
	case domainMessage.Message:
		convertToWebResult = func(domainParam any) any { return ConvertMessageToWebResult(domainParam.(domainMessage.Message)) }

		// NOTE : si on choisit de ne pas transformer la réponse (vocabulaire et forme identique à la partie cliente)
		// le formaliser ici en ajoutant les cases
		// case *PerfectUser:
		//  // La réponse est exactement la même aujourd'hui : pas de transformation
		//	return entity
	default:
		// Pour les tests, on ne convertit pas le résultat
		convertToWebResult = func(domainParam any) any { return domainParam }
	}

	return ResponseMapper{ConvertToWebResult: convertToWebResult, login: forLogin}
}

type QueryRequestMapper struct {
	ConvertToDomain func(request *http.Request) any
}

/** Construit la méthode à appeler en fonction du type attendu */
func GetQueryRequestMapper[I any](input any) QueryRequestMapper {
	var toCall func(request *http.Request) any

	switch input.(type) {
	case domain.ItemInfos:
		toCall = func(request *http.Request) any {
			id := getValueFunc(request, "id")
			parentId := getValueFunc(request, "parentId")
			if id != "" && parentId != "" {
				return domain.CreateItemInfos(id, parentId)
			}
			return nil
		}
	default:
		toCall = func(request *http.Request) any { return nil }
	}
	return QueryRequestMapper{ConvertToDomain: toCall}
}

func getValueFunc(request *http.Request, name string) string {
	value := request.PathValue(name)
	if value == "" {
		value = request.FormValue(name)
	}
	return value
}
