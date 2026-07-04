package domain

import "slices"

const (
	CREATE = "CREATE"
	UPDATE = "UPDATE"
	DELETE = "DELETE"
	READ   = "READ"
)

const ROOT_ID = "-1"

// NodeSpace : espace située par rapport aux autres espaces.
type NodeSpace struct {
	space      *Space
	parentId   string
	previousId string
	nextId     string
}

func (nodeSpace NodeSpace) GetSpace() *Space                 { return nodeSpace.space }
func (nodeSpace *NodeSpace) SetSpace(space *Space)           { nodeSpace.space = space }
func (nodeSpace NodeSpace) GetParentId() string              { return nodeSpace.parentId }
func (nodeSpace *NodeSpace) SetParentId(parentId string)     { nodeSpace.parentId = parentId }
func (nodeSpace NodeSpace) GetPreviousId() string            { return nodeSpace.previousId }
func (nodeSpace *NodeSpace) SetPreviousId(previousId string) { nodeSpace.previousId = previousId }
func (nodeSpace NodeSpace) GetNextId() string                { return nodeSpace.nextId }
func (nodeSpace *NodeSpace) SetNextId(nextId string)         { nodeSpace.nextId = nextId }

func CreateNodeSpace(space *Space, parentId, previousId, nextId string) *NodeSpace {
	nodeSpace := new(NodeSpace)
	nodeSpace.space = space
	nodeSpace.parentId = parentId
	nodeSpace.previousId = previousId
	nodeSpace.nextId = nextId
	return nodeSpace
}

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

func (spaces Spaces) ApplyModification() {
	for index := range spaces.list {
		spaces.list[index].ApplyModification()
	}
}

func (spaces *Spaces) RemoveToDelete() {
	spaces.list = slices.DeleteFunc(spaces.list, func(space *Space) bool {
		return space.IsToDelete()
	})
}

type Item interface {
	GetId() string
	GetTitle() string
	GetText() string
	GetState() string
	GetStatus() string
	GetCRUDMode() string
	GetChildren() []Item
}

// Space : arbre d'items. Selon le niveau où il se trouve, il peut s'agir d'une catégorie, d'une check list, d'une idée générale, d'une feature, ...
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
	rootSpace.SetID(id)
	rootSpace.SetChildrenSpaces(children)
	return rootSpace
}

func (space Space) GetId() string                     { return space.id }
func (space *Space) SetID(id string)                  { space.id = id }
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
func (space *Space) GetChildren() []Item {
	list := space.children.GetList()
	children := make([]Item, len(list))
	for index := range list {
		children[index] = list[index]
	}
	return children
}

func (space *Space) SetChildren(children []Item) {
	list := make([]*Space, len(children))
	for index := range children {
		child := children[index]
		list[index] = child.(*Space)
	}
	space.children.SetList(list)
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
	// Application sur les enfants
	space.children.ApplyModification()
}

func (space *Space) RemoveToDelete() {
	space.children.RemoveToDelete()
}
