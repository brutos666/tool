package domain

type ItemInfos struct {
	id       string
	parentId string
}

func (item ItemInfos) GetId() string    { return item.id }
func (item *ItemInfos) SetId(id string) { item.id = id }

func (item ItemInfos) GetParentId() string          { return item.parentId }
func (item *ItemInfos) SetParentId(parentId string) { item.parentId = parentId }

func CreateItemInfos(id, parentId string) *ItemInfos {
	return &ItemInfos{id, parentId}
}
