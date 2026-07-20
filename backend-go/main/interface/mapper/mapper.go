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

type Mapper struct {
	GetWebResultInstance func() any
	ConvertToDomain      func(requestParam any) any
	ConvertToWebResult   func(domain any) any
}

func GetMapper[I any](input any, output any) Mapper {
	var getWebResultCall func() any
	var convertToDomainCall func(requestParam any) any
	var convertToWebResult func(domain any) any

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

	switch output.(type) {
	case *domain.NodeSpace:
		convertToWebResult = func(domainParam any) any { return ConvertNodeSpaceToWebResult(domainParam.(*domain.NodeSpace)) }
	case *domain.Space:
		convertToWebResult = func(domainParam any) any { return ConvertSpaceToWebResult(domainParam.(*domain.Space)) }
	case []*domain.Space:
		convertToWebResult = func(domainParam any) any {
			domainSpaces := domainParam.([]*domain.Space)
			spaceList := make([]*SpaceWebResult, len(domainSpaces))
			for index := range domainSpaces {
				spaceList[index] = ConvertSpaceToWebResult(domainSpaces[index])
			}
			return spaceList
		}
	case *domain.LoggedUser:
		convertToWebResult = func(domainParam any) any { return ConvertLoggedUserToWebResult(domainParam.(*domain.LoggedUser)) }
	case *domain.User:
		convertToWebResult = func(domainParam any) any { return ConvertUserToWebResult(domainParam.(*domain.User)) }
	case []*domain.User:
		convertToWebResult = func(domainParam any) any {
			domainUsers := domainParam.([]*domain.User)
			userList := make([]*UserWebResult, len(domainUsers))
			for index := range domainUsers {
				userList[index] = ConvertUserToWebResult(domainUsers[index])
			}
			return userList
		}
	case *responseMessage.Message:
		convertToWebResult = func(domainParam any) any {
			return ConvertHttpMessageToWebResult(domainParam.(*responseMessage.Message))
		}
	case *domainMessage.Message:
		convertToWebResult = func(domainParam any) any {
			return ConvertDomainMessageToWebResult(domainParam.(*domainMessage.Message))
		}
		// NOTE : si on choisit de ne pas transformer la réponse (vocabulaire et forme identique à la partie cliente)
		// le formaliser ici en ajoutant les cases
		// case *PerfectUser:
		//  // La réponse est exactement la même aujourd'hui : pas de transformation
		//	return entity
	default:
		// Pour les tests, on ne convertit pas le résultat
		convertToWebResult = func(domainParam any) any { return domainParam }
	}

	return Mapper{GetWebResultInstance: getWebResultCall, ConvertToDomain: convertToDomainCall, ConvertToWebResult: convertToWebResult}
}
