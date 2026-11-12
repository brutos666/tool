package repository

import (
	"treeConverter"

	"goTool/internal/api/domain"
)

type FlatItem struct {
	id       string
	title    string
	text     string
	state    string
	parentId string
	nextId   string
}

func (item FlatItem) GetId() string                { return item.id }
func (item *FlatItem) SetId(id string)             { item.id = id }
func (item FlatItem) GetTitle() string             { return item.title }
func (item *FlatItem) SetTitle(title string)       { item.title = title }
func (item FlatItem) GetText() string              { return item.text }
func (item *FlatItem) SetText(text string)         { item.text = text }
func (item FlatItem) GetState() string             { return item.state }
func (item *FlatItem) SetState(state string)       { item.state = state }
func (item FlatItem) GetParentId() string          { return item.parentId }
func (item *FlatItem) SetParentId(parentId string) { item.parentId = parentId }
func (item FlatItem) GetNextId() string            { return item.nextId }
func (item *FlatItem) SetNextId(nextId string)     { item.nextId = nextId }
func (item FlatItem) ConvertToTree() treeConverter.TreeEntity {
	space := new(domain.Space)
	space.SetId(item.GetId())
	space.SetChildrenSpaces(new(domain.Spaces))
	space.SetStatus(treeConverter.OK)
	space.SetTitle(item.GetTitle())
	space.SetText(item.GetText())
	space.SetState(item.GetState())
	return space
}
