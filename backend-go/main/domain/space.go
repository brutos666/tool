// Package domain donne les règles métiers. On va définir ici les entités (utilisateur, espaces, ...) et ce que l'on peut de ces données (recherche, modification) via des interfaces repository. Le package domain ne connaît que lui même
package domain

import (
	"slices"
	"treeConverter"
)

const (
	CREATE = "CREATE"
	UPDATE = "UPDATE"
	DELETE = "DELETE"
	READ   = "READ"
)

// Spaces : ensemble des espaces racines
type Spaces struct {
	list []*Space
}

func (spaces Spaces) GetList() []*Space      { return spaces.list }
func (spaces *Spaces) SetList(list []*Space) { spaces.list = list }
func (spaces *Spaces) AddSpace(space *Space) { spaces.list = append(spaces.list, space) }
func (spaces Spaces) GetDeleteIds() []string {
	ids := make([]string, 0)
	for index := range spaces.list {
		ids = append(ids, spaces.list[index].GetDeleteIds()...)
	}
	return ids
}

func (spaces *Spaces) ApplyModification() {
	for index := range spaces.list {
		spaces.list[index].ApplyModification()
	}
}

func (spaces *Spaces) RemoveToDelete() {
	spaces.list = slices.DeleteFunc(spaces.list, func(space *Space) bool {
		return space.IsToDelete()
	})
}

// Space : espace. Selon le niveau où il se trouve, il peut s'agir d'une catégorie, d'une check list, d'une idée générale, d'une feature, ... il se compose de sous-espaces.
type Space struct {
	id       string
	title    string
	text     string
	state    string
	status   string
	children *Spaces
	crudMode string
	new_id   string
}

func CreateRootSpace(id string, children *Spaces) *Space {
	rootSpace := new(Space)
	rootSpace.SetId(id)
	rootSpace.SetChildrenSpaces(children)
	return rootSpace
}

func CreateSpace(id, title string, children *Spaces) *Space {
	space := new(Space)
	space.SetId(id)
	space.SetTitle(id)
	space.SetChildrenSpaces(children)
	return space
}

func (space Space) GetId() string                     { return space.id }
func (space *Space) SetId(id string)                  { space.id = id }
func (space Space) GetTitle() string                  { return space.title }
func (space *Space) SetTitle(title string)            { space.title = title }
func (space Space) GetText() string                   { return space.text }
func (space *Space) SetText(text string)              { space.text = text }
func (space Space) GetState() string                  { return space.state }
func (space *Space) SetState(state string)            { space.state = state }
func (space Space) GetStatus() string                 { return space.status }
func (space *Space) SetStatus(status string)          { space.status = status }
func (space Space) GetCRUDMode() string               { return space.crudMode }
func (space *Space) SetCRUDMode(crudMode string)      { space.crudMode = crudMode }
func (space Space) IsToCreate() bool                  { return space.crudMode == CREATE }
func (space Space) IsToUpdate() bool                  { return space.crudMode == UPDATE }
func (space Space) IsToDelete() bool                  { return space.crudMode == DELETE }
func (space *Space) GetChildrenSpaces() *Spaces       { return space.children }
func (space *Space) SetChildrenSpaces(spaces *Spaces) { space.children = spaces }
func (space *Space) GetChildren() []treeConverter.TreeEntity {
	list := space.children.GetList()
	children := make([]treeConverter.TreeEntity, len(list))
	for index := range list {
		children[index] = list[index]
	}
	return children
}

func (space *Space) SetChildren(children []treeConverter.TreeEntity) {
	list := make([]*Space, len(children))
	for index := range children {
		child := children[index]
		list[index] = child.(*Space)
	}
	spaces := new(Spaces)
	spaces.SetList(list)
	space.SetChildrenSpaces(spaces)
}

func (space Space) GetContext() string { return "Identifiant=" + space.id + ", Titre=" + space.title }

func (space Space) GetDeleteIds() []string {
	ids := make([]string, 0)
	if space.IsToDelete() {
		ids = append(ids, space.GetId())
	}
	ids = append(ids, space.GetChildrenSpaces().GetDeleteIds()...)
	return ids
}

func (space Space) GetCurrentId() string {
	if len(space.new_id) > 0 {
		return space.new_id
	}
	return space.id
}

func (space *Space) Save(id string) {
	space.new_id = id
}

func (space *Space) ApplyModification() {
	space.id = space.GetCurrentId()
	space.crudMode = READ
	space.children.RemoveToDelete()
	space.children.ApplyModification()
}
