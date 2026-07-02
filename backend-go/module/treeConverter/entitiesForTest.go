package treeConverter

import "strconv"

type ItemTreeEntity struct {
	id       int
	children []TreeEntity
	status   string
	title    string
}

func (item *ItemTreeEntity) GetId() string { return strconv.Itoa(item.id) }
func (item *ItemTreeEntity) SetChildren(children []TreeEntity) {
	item.children = children
}
func (item *ItemTreeEntity) SetStatus(status string) { item.status = status }
func (item *ItemTreeEntity) GetStatus() string       { return item.status }

type ItemFlatBdd struct {
	id           int
	parentId     int
	nextId       int
	nextIdIsNull bool
	title        string
}

func (itemFlatBdd ItemFlatBdd) GetId() string       { return strconv.Itoa(itemFlatBdd.id) }
func (itemFlatBdd ItemFlatBdd) GetParentId() string { return strconv.Itoa(itemFlatBdd.parentId) }
func (itemFlatBdd ItemFlatBdd) GetNextId() string   { return strconv.Itoa(itemFlatBdd.nextId) }

func (itemFlatBdd ItemFlatBdd) ConvertToTree() TreeEntity {
	item := new(ItemTreeEntity)
	item.id = itemFlatBdd.id
	item.children = []TreeEntity{}
	item.status = OK
	item.title = itemFlatBdd.title
	return item
}

func CreateItemFlatBdd(id int, parentId int, nextId int, nextIdIsNull bool, title string) *ItemFlatBdd {
	itemFlatBdd := new(ItemFlatBdd)
	itemFlatBdd.id = id
	itemFlatBdd.parentId = parentId
	if nextIdIsNull {
		itemFlatBdd.nextIdIsNull = true
	} else {
		itemFlatBdd.nextIdIsNull = false
		itemFlatBdd.nextId = nextId
	}
	itemFlatBdd.title = title
	return itemFlatBdd
}

func CreateItemTreeEntity(id int, status string, title string, children []*ItemTreeEntity) *ItemTreeEntity {
	item := new(ItemTreeEntity)
	item.id = id
	item.children = []TreeEntity{}
	for index := range children {
		item.children = append(item.children, children[index])
	}
	item.status = status
	item.title = title
	return item
}
