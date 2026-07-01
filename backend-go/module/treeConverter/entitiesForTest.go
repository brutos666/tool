package treeConverter

type ItemTreeEntity struct {
	id       int64
	children []TreeEntity
	status   string
	title    string
}

func (item *ItemTreeEntity) GetId() int64 { return item.id }
func (item *ItemTreeEntity) SetChildren(children []TreeEntity) {
	item.children = children
}
func (item *ItemTreeEntity) SetStatus(status string) { item.status = status }
func (item *ItemTreeEntity) GetStatus() string       { return item.status }

type ItemFlatBdd struct {
	id           int64
	parentId     int64
	nextId       int64
	nextIdIsNull bool
	title        string
}

func (itemFlatBdd ItemFlatBdd) GetId() int64       { return itemFlatBdd.id }
func (itemFlatBdd ItemFlatBdd) GetParentId() int64 { return itemFlatBdd.parentId }
func (itemFlatBdd ItemFlatBdd) GetNextIdValue() int64 {
	if itemFlatBdd.nextIdIsNull {
		return 0
	}
	return itemFlatBdd.nextId
}
func (itemFlatBdd ItemFlatBdd) IsNextIdNull() bool   { return itemFlatBdd.nextIdIsNull }
func (itemFlatBdd *ItemFlatBdd) SetNextIdNullValue() { itemFlatBdd.nextIdIsNull = true }

func (itemFlatBdd ItemFlatBdd) ConvertToTree() TreeEntity {
	item := new(ItemTreeEntity)
	item.id = itemFlatBdd.id
	item.children = []TreeEntity{}
	item.status = OK
	item.title = itemFlatBdd.title
	return item
}

func CreateItemFlatBdd(id int64, parentId int64, nextId int64, nextIdIsNull bool, title string) *ItemFlatBdd {
	itemFlatBdd := new(ItemFlatBdd)
	itemFlatBdd.id = id
	itemFlatBdd.parentId = parentId
	if nextIdIsNull {
		itemFlatBdd.nextIdIsNull = true
		itemFlatBdd.nextId = 0
	} else {
		itemFlatBdd.nextIdIsNull = false
		itemFlatBdd.nextId = nextId
	}
	itemFlatBdd.title = title
	return itemFlatBdd
}

func CreateItemTreeEntity(id int64, status string, title string, children []*ItemTreeEntity) *ItemTreeEntity {
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
