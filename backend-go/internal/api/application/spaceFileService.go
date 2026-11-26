// Package application s'occupe des cas d'usage.
// Sauvegarde, import, export, recherche des espaces, création d'un compte utilisateur, ...
// Le package application connaît le package domain puisqu'il va agir sur les entités métiers
package application

import (
	"bytes"
	"context"

	"goTool/internal/api/domain"
)

type SpaceFService struct {
	repository      domain.SpaceFileRepository
	spaceRepository domain.SpaceCommandRepository
	fileRepository  domain.FileCommandRepository
}

func SpaceFileService(repository domain.SpaceFileRepository, commandRepository domain.SpaceCommandRepository, fileRepository domain.FileCommandRepository) SpaceFService {
	return SpaceFService{repository: repository, spaceRepository: commandRepository, fileRepository: fileRepository}
}

func (fileService SpaceFService) OpenFile(ctx context.Context, dataAccessId int, sourceFile domain.FileReader) ([]*domain.Space, error) {
	// NOTE : En mode desktop, la sauvegarde enregistrera également dans ce fichier
	// NOTE : En mode navigateur, la sauvegarde mettra a jour un indicateur qui restera affiché tant que les espaces n'auront pas été téléchargés. A l'ouverture, un message alertera l'utilisateur si l'indicateur est affiché

	// 1. Importer les tâches
	spacesList, err := fileService.Import(ctx, sourceFile)
	if err != nil {
		return nil, err
	}
	spaces := new(domain.Spaces)
	spaces.SetList(spacesList)
	// 3. Supprimer les tâches de la base de données et les remplacer par les nouvelles
	err = fileService.spaceRepository.ReplaceSpaces(ctx, dataAccessId, spaces)
	if err != nil {
		return nil, err
	}
	spaces.ApplyModification()
	// Stocker le fichier ouvert dans la table des fichiers ouverts
	err = fileService.fileRepository.AddFile(ctx, dataAccessId, sourceFile.FileName())
	return spacesList, nil
}

func (fileService SpaceFService) Import(ctx context.Context, sourceFile domain.FileReader) ([]*domain.Space, error) {
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

func (fileService SpaceFService) Export(ctx context.Context, dataAccessId int, nodeSpace domain.NodeSpace) (*bytes.Buffer, error) {
	if nodeSpace.IsRoot() {
		err := fileService.fileRepository.SetExported(ctx, dataAccessId)
		if err != nil {
			return nil, nil
		}
	}
	return fileService.repository.Write(ctx, nodeSpace)
}
