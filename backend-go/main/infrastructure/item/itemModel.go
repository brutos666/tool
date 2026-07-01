// Package itemBDDRepository se charge de la gestion des données dans une base de données
package item

import (
	"database/sql"
	"treeConverter"

	"goTool/domain"
)

const NULL_VALUE_ID = 0

type ItemModel struct {
	Id       int64          `db:"id"`
	Title    string         `db:"title"`
	Text     sql.NullString `db:"text"`
	State    string         `db:"state"`
	ParentId int64          `db:"parent_id"`
	NextId   sql.NullInt64  `db:"next_id"`
}

func (itemModel ItemModel) GetId() int64                { return itemModel.Id }
func (itemModel *ItemModel) SetId(id int64)             { itemModel.Id = id }
func (itemModel *ItemModel) SetTitle(title string)      { itemModel.Title = title }
func (itemModel *ItemModel) SetState(state string)      { itemModel.State = state }
func (itemModel ItemModel) GetParentId() int64          { return itemModel.ParentId }
func (itemModel *ItemModel) SetParentId(id int64)       { itemModel.ParentId = id }
func (itemModel ItemModel) GetNextId() sql.NullInt64    { return itemModel.NextId }
func (itemModel *ItemModel) SetNextId(id sql.NullInt64) { itemModel.NextId = id }
func (itemModel ItemModel) GetNextIdValue() int64       { return getNullInt64Value(itemModel.NextId) }
func (itemModel *ItemModel) SetNextIdValue(id int64) {
	itemModel.NextId.Int64 = id
	itemModel.NextId.Valid = true
}
func (itemModel ItemModel) IsNextIdNull() bool   { return !itemModel.NextId.Valid }
func (itemModel *ItemModel) SetNextIdNullValue() { itemModel.NextId.Valid = false }
func (itemModel *ItemModel) SetText(text string) {
	if text == "" {
		itemModel.Text.Valid = false
	} else {
		itemModel.Text.Valid = true
		itemModel.Text.String = text
	}
}

func (itemModel ItemModel) ConvertToTree() treeConverter.TreeEntity {
	item := new(domain.ItemFound)
	item.SetId(itemModel.Id)
	item.SetChildren([]treeConverter.TreeEntity{})
	item.SetStatus(treeConverter.OK)
	item.SetTitle(itemModel.Title)
	if itemModel.Text.Valid {
		item.SetText(itemModel.Text.String)
	} else {
		item.SetText("")
	}
	item.SetState(itemModel.State)
	return item
}

func getNullInt64Value(nullInt sql.NullInt64) int64 {
	if nullInt.Valid {
		return nullInt.Int64
	}
	return NULL_VALUE_ID
}
