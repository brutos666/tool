// Package item s'occupe du traitement de la frontière des items entre la partie cliente et la partie serveur
package itemWebResult

import "goTool/domain"

type ItemWebResult struct {
	ID       int64            `json:"id"`
	Title    string           `json:"title"`
	Text     string           `json:"text"`
	State    string           `json:"state"`
	Children []*ItemWebResult `json:"children"`
	Status   string           `json:"status"`
	CRUDMode string           `json:"CRUDMode"`
}

func ConvertItemFoundToWebResult(itemFound *domain.ItemFound) *ItemWebResult {
	itemWebResult := new(ItemWebResult)
	itemWebResult.ID = itemFound.GetId()
	itemWebResult.Title = itemFound.GetTitle()
	itemWebResult.Text = itemFound.GetText()
	itemWebResult.State = itemFound.GetState()
	itemWebResult.Status = itemFound.GetStatus()
	itemWebResult.CRUDMode = domain.READ
	foundChildren := itemFound.GetChildren()
	children := make([]*ItemWebResult, len(foundChildren))
	for index, foundChild := range foundChildren {
		children[index] = ConvertItemFoundToWebResult(foundChild.(*domain.ItemFound))
	}
	itemWebResult.Children = children
	return itemWebResult
}

func ConvertItemsFoundToWebResult(itemsFound []*domain.ItemFound) []*ItemWebResult {
	itemsWebResult := make([]*ItemWebResult, len(itemsFound))
	for index := range itemsFound {
		itemsWebResult[index] = ConvertItemFoundToWebResult(itemsFound[index])
	}
	return itemsWebResult
}
