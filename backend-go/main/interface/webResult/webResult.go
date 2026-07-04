// Package webResult s'occupe du traitement de la frontière des items entre la partie cliente et la partie serveur
package webResult

import (
	"goTool/domain"
)

type WebResult interface {
	ConvertToParam() any
}

func GetInstance(entity any) WebResult {
	switch entity.(type) {
	case *domain.NodeSpace:
		return new(NodeSpaceWebResult)
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
	}
	return nil
}
