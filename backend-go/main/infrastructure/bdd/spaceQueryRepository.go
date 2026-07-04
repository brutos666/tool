package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"treeConverter"

	"goTool/domain"
	"goTool/infrastructure/configuration"
	"goTool/infrastructure/entityBdd"
)

const SELECT_ALL string = "SELECT id, title, text, state, parent_id, next_id FROM item"

type spaceQryRepository struct{}

func SpaceQueryRepository() domain.SpaceQueryRepository {
	return &spaceQryRepository{}
}

func (repo *spaceQryRepository) FindAll(ctx context.Context) ([]*domain.Space, error) {
	return connection.LaunchNormalWay(ctx, configuration.BaseConnection, selectAllSpaces, "")
}

func selectAllSpaces(connection connection.Connection, notUsed string) ([]*domain.Space, error) {
	var spaceModels []entityBdd.SpaceModel
	err := requestSQL.Select(connection, &spaceModels, SELECT_ALL)
	if err != nil {
		return nil, err
	}
	spaces := treeConverter.ConvertFlatToTree[entityBdd.SpaceModel, *domain.Space](domain.ROOT_ID, spaceModels)
	return spaces, nil
}
