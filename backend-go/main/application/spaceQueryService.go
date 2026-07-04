// Package application s'occupe des cas d'usage.
// Sauvegarde, import, export, recherche des espaces, création d'un compte utilisateur, ...
// Le package application connaît le package domain puisqu'il va agir sur les entités métiers
package application

import (
	"context"

	"goTool/domain"
)

type SpaceQryService struct {
	repository domain.SpaceQueryRepository
}

func SpaceQueryService(repository domain.SpaceQueryRepository) SpaceQryService {
	return SpaceQryService{repository: repository}
}

func (queryService SpaceQryService) FindAll(ctx context.Context) ([]*domain.Space, error) {
	return queryService.repository.FindAll(ctx)
}
