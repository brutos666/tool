// Package webResult s'occupe du traitement de la frontière des items entre la partie cliente et la partie serveur
package webResult

import (
	"goTool/domain"
)

func GetInstance(entity any) any {
	switch entity.(type) {
	case *domain.NodeSpace:
		return new(NodeSpaceWebResult)
	case *domain.User:
		return new(RegisterUserWebResult)
	}
	return nil
}

func Convert(entity interface{}) any {
	switch typedEntity := entity.(type) {
	case *domain.NodeSpace:
		return ConvertNodeSpaceToWebResult(typedEntity)
	case *domain.Space:
		return ConvertSpaceToWebResult(typedEntity)
	case []*domain.Space:
		spaceList := make([]*SpaceWebResult, len(typedEntity))
		for index := range typedEntity {
			spaceList[index] = ConvertSpaceToWebResult(typedEntity[index])
		}
		return spaceList
	case *domain.User:
		return ConvertUserToWebResult(typedEntity)
	case []*domain.User:
		userList := make([]*UserWebResult, len(typedEntity))
		for index := range typedEntity {
			userList[index] = ConvertUserToWebResult(typedEntity[index])
		}
		return userList
	case *RegisterUserWebResult:
		return typedEntity.ConvertToUser()
	case *NodeSpaceWebResult:
		return typedEntity.ConvertToNodeSpace()
		// NOTE : si on choisit de ne pas transformer la réponse (vocabulaire et forme identique à la partie cliente)
		// le formaliser ici
		// case *PerfectUser:
		//  // La réponse est exactement la même aujourd'hui : pas de transformation
		//	return entity
	}
	// Pour les tests, on ne convertit pas le résultat
	return entity
}
