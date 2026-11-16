package repository

import (
	"context"
	"treeConverter"

	"goTool/internal/api/domain"
	"goTool/internal/api/infrastructure/bddService"
	"goTool/internal/api/infrastructure/entityBdd"
)

const (
	SELECT_ALL  string = "SELECT id, title, text, state, parent_id, next_id FROM item"
	SELECT_TREE string = "WITH RECURSIVE tree AS (" +
		"SELECT id, title, text, state, parent_id, next_id, 1 AS niveau FROM item WHERE id = ? " +
		"UNION ALL " +
		"SELECT n.id, n.title, n.text, n.state, n.parent_id, n.next_id, a.niveau + 1 FROM item n " +
		"JOIN tree a ON n.parent_id = a.id)" +
		"SELECT id, title, text, state, parent_id, next_id FROM tree"
)

type spaceQryRepository struct{}

func SpaceQuery() domain.SpaceQueryRepository {
	return &spaceQryRepository{}
}

func (repo *spaceQryRepository) FindAll(ctx context.Context, dataAccessId int) ([]*domain.Space, error) {
	return selectAllSpaces(ctx, bddAccessService.RetrieveReadAccess(dataAccessId))
}

func (repo *spaceQryRepository) Load(ctx context.Context, dataAccessId int, item domain.ItemInfos) (*domain.Space, error) {
	return selectSpace(ctx, bddAccessService.RetrieveReadAccess(dataAccessId), item)
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

func selectSpace(ctx context.Context, dataBase bddService.ReadCommands, item domain.ItemInfos) (*domain.Space, error) {
	var spaceModels []entityBdd.SpaceModel
	err := dataBase.Select(ctx, SELECT_TREE, &spaceModels, item.GetId())
	if err != nil {
		return nil, err
	}
	spaces := treeConverter.ConvertFlatToTree[entityBdd.SpaceModel, *domain.Space](item.GetParentId(), spaceModels)
	return spaces[0], nil
}
