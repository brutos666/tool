package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"treeConverter"

	"goTool/domain"
	"goTool/infrastructure/configuration"
	"goTool/infrastructure/item"
)

const SELECT_ALL string = "SELECT id, title, text, state, parent_id, next_id FROM item"

type itemQryRepository struct{}

func ItemQueryRepository() domain.ItemQueryRepository {
	return &itemQryRepository{}
}

func (repo *itemQryRepository) FindAll(ctx context.Context) ([]*domain.ItemFound, error) {
	return connection.LaunchNormalWay(ctx, configuration.BaseConnection, selectAllItems, "")
}

func (repo *itemQryRepository) Save(ctx context.Context, item *domain.ItemToSave) error {
	return nil
}

func selectAllItems(connection connection.Connection, notUsed string) ([]*domain.ItemFound, error) {
	var itemsModel []item.ItemModel
	err := requestSQL.Select(connection, &itemsModel, SELECT_ALL)
	if err != nil {
		return nil, err
	}
	itemsFound := treeConverter.ConvertFlatToTree[item.ItemModel, *domain.ItemFound](itemsModel)
	return itemsFound, nil
}
