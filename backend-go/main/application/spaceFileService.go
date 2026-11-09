// Package application s'occupe des cas d'usage.
// Sauvegarde, import, export, recherche des espaces, création d'un compte utilisateur, ...
// Le package application connaît le package domain puisqu'il va agir sur les entités métiers
package application

import (
	"context"
	"io"

	"goTool/domain"
)

type SpaceFService struct {
	repository domain.SpaceFileRepository
}

func SpaceFileService(repository domain.SpaceFileRepository) SpaceFService {
	return SpaceFService{repository: repository}
}

func (fileService SpaceFService) Import(ctx context.Context, sourceFile io.Reader) ([]*domain.Space, error) {
	spaces, err := fileService.repository.Load(ctx, sourceFile)
	if err != nil {
		return nil, err
	}
	// L'import s'ajoute à l'existant en tant que nouveaux espaces
	for _, space := range spaces {
		space.SetToCreate()
	}
	return spaces, nil
}

func (fileService SpaceFService) Save(ctx context.Context) error {
	return fileService.repository.Save(ctx)
}
