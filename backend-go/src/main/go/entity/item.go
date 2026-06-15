package entity

import "slices"

const CREATE = "CREATE"
const UPDATE = "UPDATE"
const DELETE = "DELETE"
const READ = "READ"

const NEXT_NOT_FOUND = "NEXT_NOT_FOUND"
const LOOP = "LOOP"
const ORPHAN = "ORPHAN"
const TOTAL_ORPHAN = "TOTAL_ORPHAN"

const NULL_VALUE_ID = 0
const ROOT_ID = -1

type Item struct {
	id int64
	title string
	text string
	state string
	children []Item
	status string
	crudMode string
}

func (item Item) GetId() int64 { return item.id }
func (item *Item) SetID(id int64) { item.id = id }
func (item Item) GetTitle() string { return item.title }
func (item Item) GetChildren() []Item {	return item.children }
func (item *Item) SetChildren(children []Item) { item.children = children }
func (item Item) GetCRUDMode() string {	return item.crudMode }
func (item *Item) SetCRUDMode(crudMode string) {	item.crudMode = crudMode }
func (item Item) IsToCreate() bool { return item.crudMode == CREATE }
func (item Item) IsToUpdate() bool { return item.crudMode == UPDATE }
func (item Item) IsToDelete() bool { return item.crudMode == DELETE }
func (item *Item) SetToUpdate() { item.crudMode = UPDATE }
func (item *Item) SetRead() { item.crudMode = READ }
func (item *Item) SetOrphan() { 	item.status = getNewStatus(item.status, ORPHAN) }
func (item *Item) SetNextNotFound() {	item.status = getNewStatus(item.status, NEXT_NOT_FOUND) }
func (item *Item) SetLoop() {	item.status = LOOP }
func (item *Item) RemoveDeletedChildren() []Item {
   item.children = slices.DeleteFunc(item.children, func (item Item) bool { 
		return item.IsToDelete() 
	})
	return item.children
}

func (item Item) ConvertToWebResult() ItemWebResult {
		var itemWebResult ItemWebResult
		itemWebResult.ID = item.id
		itemWebResult.Title = item.title
		itemWebResult.Text = item.text
		itemWebResult.State = item.state
		itemWebResult.Status = item.status
		itemWebResult.CRUDMode = item.crudMode
		children := []ItemWebResult{}
		for _, child := range item.children {
			children = append(children, child.ConvertToWebResult())
		}
		itemWebResult.Children = children
		return itemWebResult
}

func (item Item) ConvertToItemModel(parentId int64, nextId int64, nextIdIsNull bool) ItemModel {
		var itemModel ItemModel
		itemModel.SetId(item.id)
		itemModel.SetTitle(item.title)
		itemModel.SetText(item.text)
		itemModel.SetState(item.state)
		itemModel.SetParentId(parentId)
		if (nextIdIsNull) {
			itemModel.SetNextIdNullValue()
		} else {
			itemModel.SetNextIdValue(nextId)
		}
		return itemModel
}

func CreateItem(id int64, title string, text string, state string, status string, children []Item) *Item {
	item := new(Item)
	item.id = id
	item.title = title
	item.text = text
	item.state = state
	item.children = children
	item.status = status
	item.crudMode = ""
	return item
}

func getNewStatus(status string, statusToApply string) (string) {
	if (status == ORPHAN && statusToApply == NEXT_NOT_FOUND || status == NEXT_NOT_FOUND && statusToApply == ORPHAN) {
		return TOTAL_ORPHAN
	}
	return statusToApply
}
