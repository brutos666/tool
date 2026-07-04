package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"treeConverter"

	"goTool/domain"
	"goTool/infrastructure/configuration"
	"goTool/infrastructure/itemBdd"
)

const SELECT_ALL string = "SELECT id, title, text, state, parent_id, next_id FROM item"

type itemQryRepository struct{}

func ItemQueryRepository() domain.ItemQueryRepository {
	return &itemQryRepository{}
}

func (repo *itemQryRepository) FindAll(ctx context.Context) ([]*domain.ItemFound, error) {
	return connection.LaunchNormalWay(ctx, configuration.BaseConnection, selectAllItems, "")
}

func selectAllItems(connection connection.Connection, notUsed string) ([]*domain.ItemFound, error) {
	var itemsModel []itemBdd.ItemModel
	err := requestSQL.Select(connection, &itemsModel, SELECT_ALL)
	if err != nil {
		return nil, err
	}
	itemsFound := treeConverter.ConvertFlatToTree[itemBdd.ItemModel, *domain.ItemFound](domain.ROOT_ID, itemsModel)
	return itemsFound, nil
}
