package bdd

import (
	"context"
	"treeConverter"

	"goTool/domain"
	"goTool/infrastructure/bddService"
	"goTool/infrastructure/entityBdd"
)

const SELECT_ALL string = "SELECT id, title, text, state, parent_id, next_id FROM item"

type spaceQryRepository struct{}

func SpaceQueryRepository() domain.SpaceQueryRepository {
	return &spaceQryRepository{}
}

func (repo *spaceQryRepository) FindAll(ctx context.Context, dataAccessId int) ([]*domain.Space, error) {
	return selectAllSpaces(ctx, bddAccessService.RetrieveReadAccess(dataAccessId))
}

func selectAllSpaces(ctx context.Context, dataBase bddService.ReadCommands) ([]*domain.Space, error) {
	var spaceModels []entityBdd.SpaceModel
	err := dataBase.Select(ctx, SELECT_ALL, &spaceModels)
	if err != nil {
		return nil, err
	}
	spaces := treeConverter.ConvertFlatToTree[entityBdd.SpaceModel, *domain.Space](domain.ROOT_ID, spaceModels)
	return spaces, nil
}
