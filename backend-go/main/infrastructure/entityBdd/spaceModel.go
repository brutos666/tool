// Package entityBdd se charge de la gestion des données dans une base de données
package entityBdd

import (
	"database/sql"
	"strconv"
	"treeConverter"

	"goTool/domain"
)

const NULL_VALUE_ID = 0

type SpaceModel struct {
	Id       int64          `db:"id"`
	Title    string         `db:"title"`
	Text     sql.NullString `db:"text"`
	State    string         `db:"state"`
	ParentId int64          `db:"parent_id"`
	NextId   sql.NullInt64  `db:"next_id"`
}

func (spaceBdd SpaceModel) GetId() string { return strconv.FormatInt(spaceBdd.Id, 10) }

// SetId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (spaceBdd *SpaceModel) SetId(id string) error {
	intId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return err
	}
	spaceBdd.Id = intId
	return nil
}
func (spaceBdd *SpaceModel) SetTitle(title string) { spaceBdd.Title = title }
func (spaceBdd *SpaceModel) SetState(state string) { spaceBdd.State = state }
func (spaceBdd *SpaceModel) SetText(text string) {
	if text == "" {
		spaceBdd.Text.Valid = false
	} else {
		spaceBdd.Text.Valid = true
		spaceBdd.Text.String = text
	}
}
func (spaceBdd SpaceModel) GetParentId() string { return strconv.FormatInt(spaceBdd.ParentId, 10) }

// SetParentId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (spaceBdd *SpaceModel) SetParentId(parentId string) error {
	intId, err := strconv.ParseInt(parentId, 10, 64)
	if err != nil {
		return err
	}
	spaceBdd.ParentId = intId
	return nil
}

func (spaceBdd SpaceModel) GetNextId() string {
	if spaceBdd.NextId.Valid {
		return strconv.FormatInt(spaceBdd.NextId.Int64, 10)
	}
	return ""
}

// SetNextId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (spaceBdd *SpaceModel) SetNextId(nextId string) error {
	if len(nextId) == 0 {
		spaceBdd.NextId.Valid = false
		return nil
	}
	intId, err := strconv.ParseInt(nextId, 10, 64)
	if err != nil {
		return err
	}
	spaceBdd.NextId.Int64 = intId
	spaceBdd.NextId.Valid = true
	return nil
}

func (spaceBdd SpaceModel) ConvertToTree() treeConverter.TreeEntity {
	space := new(domain.Space)
	space.SetId(spaceBdd.GetId())
	space.SetChildrenSpaces(new(domain.Spaces))
	space.SetStatus(treeConverter.OK)
	space.SetTitle(spaceBdd.Title)
	if spaceBdd.Text.Valid {
		space.SetText(spaceBdd.Text.String)
	} else {
		space.SetText("")
	}
	space.SetState(spaceBdd.State)
	return space
}

func ConvertSpaceToModel(space domain.Space, parentId, nextId string) *SpaceModel {
	itemModel := new(SpaceModel)
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
