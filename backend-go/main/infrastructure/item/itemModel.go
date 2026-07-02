// Package itemBDDRepository se charge de la gestion des données dans une base de données
package item

import (
	"database/sql"
	"strconv"
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

func (itemModel ItemModel) GetId() string       { return strconv.FormatInt(itemModel.Id, 10) }
func (itemModel ItemModel) GetParentId() string { return strconv.FormatInt(itemModel.ParentId, 10) }
func (itemModel ItemModel) GetNextId() string {
	if itemModel.NextId.Valid {
		return strconv.FormatInt(itemModel.NextId.Int64, 10)
	}
	return ""
}

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
	item.SetId(itemModel.GetId())
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
