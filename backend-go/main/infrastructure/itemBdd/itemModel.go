// Package itemBdd se charge de la gestion des données dans une base de données
package itemBdd

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

func (itemModel ItemModel) GetId() string { return strconv.FormatInt(itemModel.Id, 10) }

// SetId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (itemModel *ItemModel) SetId(id string) error {
	intId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return err
	}
	itemModel.Id = intId
	return nil
}
func (itemModel *ItemModel) SetTitle(title string) { itemModel.Title = title }
func (itemModel *ItemModel) SetState(state string) { itemModel.State = state }
func (itemModel *ItemModel) SetText(text string) {
	if text == "" {
		itemModel.Text.Valid = false
	} else {
		itemModel.Text.Valid = true
		itemModel.Text.String = text
	}
}
func (itemModel ItemModel) GetParentId() string { return strconv.FormatInt(itemModel.ParentId, 10) }

// SetParentId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (itemModel *ItemModel) SetParentId(parentId string) error {
	intId, err := strconv.ParseInt(parentId, 10, 64)
	if err != nil {
		return err
	}
	itemModel.ParentId = intId
	return nil
}

func (itemModel ItemModel) GetNextId() string {
	if itemModel.NextId.Valid {
		return strconv.FormatInt(itemModel.NextId.Int64, 10)
	}
	return ""
}

// SetNextId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (itemModel *ItemModel) SetNextId(nextId string) error {
	if len(nextId) == 0 {
		itemModel.NextId.Valid = false
		return nil
	}
	intId, err := strconv.ParseInt(nextId, 10, 64)
	if err != nil {
		return err
	}
	itemModel.NextId.Int64 = intId
	return nil
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

func ConvertSpaceToItemModel(space domain.Space, parentId, nextId string) *ItemModel {
	itemModel := new(ItemModel)
	if !space.IsToCreate() {
		err := itemModel.SetId(space.GetCurrentId())
		if err != nil {
			panic("Incohérence entre les données et la base de données. L'identifiant de l'item (" + space.GetContext() + ") doit pouvoir être convertit en entier")
		}
	}
	itemModel.SetTitle(space.GetTitle())
	itemModel.SetText(space.GetText())
	itemModel.SetState(space.GetState())
	err := itemModel.SetParentId(parentId)
	if err != nil {
		panic("Incohérence entre les données et la base de données. L'identifiant parent '" + parentId + "' de l'item (" + space.GetContext() + ") doit être renseigné et doit pouvoir être convertit en entier")
	}
	err = itemModel.SetNextId(nextId)
	if err != nil {
		panic("Incohérence entre les données et la base de données. L'identifiant suivant '" + nextId + "' de l'item (" + space.GetContext() + ") doit pouvoir être convertit en entier lorsqu'il est renseigné")
	}
	return itemModel
}

func ConvertIdToBdd(id string) int64 {
	intId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		panic("Incohérence entre les données et la base de données. L'identifiant '" + id + "' doit être renseigné et doit pouvoir être convertit en entier")
	}
	return intId
}

func GetCurrentBddId(space *domain.Space) int64 {
	intId, err := strconv.ParseInt(space.GetCurrentId(), 10, 64)
	if err != nil {
		panic("Incohérence entre les données et la base de données. L'identifiant de l'item (" + space.GetContext() + ") doit pouvoir être convertit en entier")
	}
	return intId
}
