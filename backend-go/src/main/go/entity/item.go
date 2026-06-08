package entity

import "database/sql"

type ItemWebResult struct {
	ID int `json:"id"`
	Title string `json:"title"`
	Text string `json:"text"`
	State string `json:"state"`
	ParentID int `json:"parentId"`
	Children []ItemWebResult `json:"children"`
	Status string `json:"status"`
	CRUDMode string `json:"CRUDMode"`
}

type ItemModel struct {
	ID int `db:"id"`
	Title string `db:"title"`
	Text sql.NullString `db:"text"`
	State string `db:"state"`
	ParentID int `db:"parent_id"`
	NextID sql.NullInt64 `db:"next_id"`
}

type Item struct {
	ID int
	Title string
	Text string
	State string
	ParentID int
	Children []Item
	Status string
	CRUDMode string
}
func (item Item) ConvertToWebResult() ItemWebResult {
		var itemWebResult ItemWebResult
		itemWebResult.ID = item.ID
		itemWebResult.Title = item.Title
		itemWebResult.Text = item.Text
		itemWebResult.State = item.State
		itemWebResult.Status = item.Status
		itemWebResult.ParentID = item.ParentID
		children := []ItemWebResult{}
		for _, child := range item.Children {
			children = append(children, child.ConvertToWebResult())
		}
		itemWebResult.Children = children
		return itemWebResult
}

func (itemModel ItemModel) ConvertToItem() Item {
		var item Item
		item.ID = itemModel.ID
		item.Title = itemModel.Title
		if (itemModel.Text.Valid) {
			item.Text = itemModel.Text.String
		}
		item.State = itemModel.State
		item.ParentID = itemModel.ParentID
		item.Children = []Item{}
		item.Status = "OK"
		return item
}

func ConvertItemToWebResult(item Item) ItemWebResult {
		var itemWebResult ItemWebResult
		itemWebResult.ID = item.ID
		itemWebResult.Title = item.Title
		itemWebResult.Text = item.Text
		itemWebResult.State = item.State
		itemWebResult.Status = item.Status
		itemWebResult.ParentID = item.ParentID
		children := []ItemWebResult{}
		for _, child := range item.Children {
			children = append(children, ConvertItemToWebResult(child))
		}
		itemWebResult.Children = children
		return itemWebResult
}