// Package application s'occupe des cas d'usage (sauvegarde/import/export/recherche des items, création d'un compte utilisateur, ...)
package application

import (
	"context"

	"goTool/domain"
)

type ItemQryService struct {
	repository domain.ItemQueryRepository
}

func ItemQueryService(repository domain.ItemQueryRepository) ItemQryService {
	return ItemQryService{repository: repository}
}

func (queryService ItemQryService) FindAll(ctx context.Context) ([]*domain.ItemFound, error) {
	return queryService.repository.FindAll(ctx)
}
