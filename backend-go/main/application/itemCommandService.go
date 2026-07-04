package application

import (
	"context"

	"goTool/domain"
)

type ItemCmdService struct {
	repository domain.ItemCommandRepository
}

func ItemCommandService(repository domain.ItemCommandRepository) ItemCmdService {
	return ItemCmdService{repository: repository}
}

func (commandService ItemCmdService) Save(ctx context.Context, nodeSpace *domain.NodeSpace) (*domain.NodeSpace, error) {
	// Le navigateur ne distingue pas encore espaces qui est la liste des espaces (Navigation) de l'espace courant qui est visualisé à droite. On va faire la distinction ici
	if len(nodeSpace.GetParentId()) == 0 {
		spaces, err := commandService.SaveSpaces(ctx, nodeSpace.GetSpace().GetChildrenSpaces())
		if err != nil {
			return nil, err
		}
		rootNode := domain.CreateNodeSpace(domain.CreateRootSpace(nodeSpace.GetSpace().GetId(), spaces), "", "", "")
		return rootNode, nil
	}
	return commandService.SaveCurrentSpace(ctx, nodeSpace)
}

func (commandService ItemCmdService) SaveSpaces(ctx context.Context, spaces *domain.Spaces) (*domain.Spaces, error) {
	err := commandService.repository.SaveSpaces(ctx, spaces)
	if err != nil {
		return spaces, err
	}
	spaces.RemoveToDelete()
	spaces.ApplyModification()
	return spaces, nil
}

func (commandService ItemCmdService) SaveCurrentSpace(ctx context.Context, nodeSpace *domain.NodeSpace) (*domain.NodeSpace, error) {
	err := commandService.repository.SaveCurrentSpace(ctx, nodeSpace)
	if err != nil {
		return nodeSpace, err
	}
	// Si tout s'est bien passé, on met à jour les références
	space := nodeSpace.GetSpace()
	space.RemoveToDelete()
	space.ApplyModification()
	return nodeSpace, nil
}
