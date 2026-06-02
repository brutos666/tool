package repository

import (
	"goTool/database"
	"goTool/entity"
)
var children1 = []entity.Item {
	{ID:3, ParentID:1, Title:"Le faire bien", Text:"", State:"TODO", Status:"OK", Children: []entity.Item{}},
	{ID:4, ParentID:1, Title:"Le faire pour les bonnes raisons", Text:"", State:"DONE", Status:"OK", Children: []entity.Item{}},
}
var items = []entity.Item {
	{ID:1, ParentID:-1, Title:"Faire quelque chose de ma vie", Text:"", State:"TODO", Status:"OK", Children: children1},
	{ID:2, ParentID:-1, Title:"Regarder les 8 saisons de Dexter", Text:"", State:"DONE", Status:"OK", Children: []entity.Item{}},
}

func FindAll() []entity.Item {
	database.Connect();
	return items
}