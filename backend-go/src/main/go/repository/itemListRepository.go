package repository

import (
	"database/server/requestSQL"
	"goTool/entity"
)



func FindAll() ([]entity.ItemModel, error) {
	var itemsModel []entity.ItemModel
	err := requestSQL.Select(baseConnection, &itemsModel, "SELECT id, title, text, state, parent_id, next_id FROM item")
	return itemsModel, err
}