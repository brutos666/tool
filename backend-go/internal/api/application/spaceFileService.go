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
	repository        domain.SpaceFileRepository
	commandRepository domain.SpaceCommandRepository
}

func SpaceFileService(repository domain.SpaceFileRepository, commandRepository domain.SpaceCommandRepository) SpaceFService {
	return SpaceFService{repository: repository, commandRepository: commandRepository}
}

func (fileService SpaceFService) OpenFile(ctx context.Context, dataAccessId int, sourceFile domain.FileReader) ([]*domain.Space, error) {
	// TODO sauvegarder l'ancienne version dans un fichier local. Faire une table "status" permettant de stocker le nom du dernier fichier ouvert, la date d'ouverture, la date du dernier upload, la date de la dernière sauvegarde. Permettre à l'utilisateur de récupérer les anciennes versions ou de les supprimer. Informer l'utilisateur qu'il doit faire du ménage au delà d'un certain nombre de sauvegarde. Ne sauvegarder dans un fichier que si pas eu d'export avant

	// TODO 1. sauvegarder les taches dans un fichier si pas eu d'export (sourceFile.FileName())
	// 2. Importer les tâches
	spacesList, err := fileService.Import(ctx, sourceFile)
	if err != nil {
		return nil, err
	}
	spaces := new(domain.Spaces)
	spaces.SetList(spacesList)
	// 3. Supprimer les tâches de la base de données et les remplacer par les nouvelles
	err = fileService.commandRepository.ReplaceSpaces(ctx, dataAccessId, spaces)
	if err != nil {
		return nil, err
	}
	spaces.ApplyModification()
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

func (fileService SpaceFService) Export(ctx context.Context, nodeSpace domain.NodeSpace) (*bytes.Buffer, error) {
	return fileService.repository.Write(ctx, nodeSpace)
}
