package application

import (
	"context"

	"goTool/domain"
)

type SpaceCmdService struct {
	repository domain.SpaceCommandRepository
}

func SpaceCommandService(repository domain.SpaceCommandRepository) SpaceCmdService {
	return SpaceCmdService{repository: repository}
}

func (commandService SpaceCmdService) Save(ctx context.Context, dataAccess domain.DataAccess, nodeSpace domain.NodeSpace) (*domain.NodeSpace, error) {
	// Le navigateur ne distingue pas encore espaces qui est la liste des espaces (Navigation) de l'espace courant qui est visualisé à droite. On va faire la distinction ici
	if len(nodeSpace.GetParentId()) == 0 {
		spaces, err := commandService.SaveSpaces(ctx, dataAccess, nodeSpace.GetSpace().GetChildrenSpaces())
		if err != nil {
			return nil, err
		}
		rootNode := domain.CreateNodeSpace(domain.CreateRootSpace(nodeSpace.GetSpace().GetId(), spaces), "", "", "")
		return rootNode, nil
	}
	return commandService.SaveCurrentSpace(ctx, dataAccess, nodeSpace)
}

func (commandService SpaceCmdService) SaveSpaces(ctx context.Context, dataAccess domain.DataAccess, spaces *domain.Spaces) (*domain.Spaces, error) {
	err := commandService.repository.SaveSpaces(ctx, dataAccess, spaces)
	if err != nil {
		return spaces, err
	}
	spaces.RemoveToDelete()
	spaces.ApplyModification()
	return spaces, nil
}

func (commandService SpaceCmdService) SaveCurrentSpace(ctx context.Context, dataAccess domain.DataAccess, nodeSpace domain.NodeSpace) (*domain.NodeSpace, error) {
	err := commandService.repository.SaveCurrentSpace(ctx, dataAccess, &nodeSpace)
	if err != nil {
		return &nodeSpace, err
	}
	// Si tout s'est bien passé, on met à jour les références
	space := nodeSpace.GetSpace()
	space.RemoveToDelete()
	space.ApplyModification()
	return &nodeSpace, nil
}
