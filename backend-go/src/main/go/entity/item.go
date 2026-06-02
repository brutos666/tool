package entity

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