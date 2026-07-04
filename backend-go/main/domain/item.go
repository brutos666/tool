// Package domain permet de définir les règles métier
package domain

import (
	"treeConverter"
)

const (
	OK             = "OK"
	NEXT_NOT_FOUND = "NEXT_NOT_FOUND"
	LOOP           = "LOOP"
	ORPHAN         = "ORPHAN"
	TOTAL_ORPHAN   = "TOTAL_ORPHAN"
)

// Un item est une catégorie, une idée ou une tâche à faire. Elle peut être décomposée en sous-items, eux-même décomposés en sous et ainsi de suite...
// Il s'agit donc d'un arbre dont la racine représente l'idée générale et les feuilles les plus petites parties de cette idée
type ItemFound struct {
	id       string
	title    string
	text     string
	state    string
	children []treeConverter.TreeEntity
	status   string // Lié à la manière dont sont stockés les données. Le statut permet d'identifier les incohérences en terme de hiérarchie lors de la récupération des données (Orphelin, boucle, ...)
}

func (item *ItemFound) GetId() string                                   { return item.id }
func (item *ItemFound) SetId(id string)                                 { item.id = id }
func (item *ItemFound) GetTitle() string                                { return item.title }
func (item *ItemFound) SetTitle(title string)                           { item.title = title }
func (item *ItemFound) GetText() string                                 { return item.text }
func (item *ItemFound) SetText(text string)                             { item.text = text }
func (item *ItemFound) GetState() string                                { return item.state }
func (item *ItemFound) SetState(state string)                           { item.state = state }
func (item *ItemFound) GetChildren() []treeConverter.TreeEntity         { return item.children }
func (item *ItemFound) SetChildren(children []treeConverter.TreeEntity) { item.children = children }
func (item *ItemFound) GetStatus() string                               { return item.status }
func (item *ItemFound) SetStatus(status string)                         { item.status = status }
