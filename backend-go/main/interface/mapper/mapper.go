// Package mapper s'occupe des conversions entre le domain et l'interface et inversement
package mapper

import (
	"goTool/domain"
	"goTool/domain/domainMessage"
	"goTool/interface/handler/responseMessage"
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
}

type RequestMapper struct {
	GetWebResultInstance func() any
	ConvertToDomain      func(requestParam any) any
}

func GetRequestMapper[I any](input any) RequestMapper {
	var getWebResultCall func() any
	var convertToDomainCall func(requestParam any) any

	switch input.(type) {
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

	switch output.(type) {
	case *domain.NodeSpace:
		convertToWebResult = func(domainParam any) any { return ConvertNodeSpaceToWebResult(domainParam.(*domain.NodeSpace)) }
	case *domain.Space:
		convertToWebResult = func(domainParam any) any { return ConvertSpaceToWebResult(domainParam.(*domain.Space)) }
	case []*domain.Space:
		convertToWebResult = func(domainParam any) any { return ConvertSpacesToWebResult(domainParam.([]*domain.Space)) }
	case *domain.LoggedUser:
		convertToWebResult = func(domainParam any) any { return ConvertLoggedUserToWebResult(domainParam.(*domain.LoggedUser)) }
	case *domain.User:
		convertToWebResult = func(domainParam any) any { return ConvertUserToWebResult(domainParam.(*domain.User)) }
	case []*domain.User:
		convertToWebResult = func(domainParam any) any { return ConvertUsersToWebResult(domainParam.([]*domain.User)) }
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

	return ResponseMapper{ConvertToWebResult: convertToWebResult}
}
