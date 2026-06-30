package entity

type ItemWebResult struct {
	ID int64 `json:"id"`
	Title string `json:"title"`
	Text string `json:"text"`
	State string `json:"state"`
	Children []ItemWebResult `json:"children"`
	Status string `json:"status"`
	CRUDMode string `json:"CRUDMode"`
}

func (itemWebResult ItemWebResult) ConvertToItem() *Item {
		var item = new(Item)
		item.id = itemWebResult.ID
		item.title = itemWebResult.Title
		item.text = itemWebResult.Text
		item.state = itemWebResult.State
		item.status = itemWebResult.Status
		item.crudMode = itemWebResult.CRUDMode
		children := []Item{}
		for _, child := range itemWebResult.Children {
			children = append(children, *child.ConvertToItem())
		}
		item.children = children
		return item
}