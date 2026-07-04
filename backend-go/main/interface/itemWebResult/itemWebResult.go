// Package item s'occupe du traitement de la frontière des items entre la partie cliente et la partie serveur
package itemWebResult

import (
	"goTool/domain"
)

type ItemWebResult struct {
	ID       string           `json:"id"`
	Title    string           `json:"title"`
	Text     string           `json:"text"`
	State    string           `json:"state"`
	Children []*ItemWebResult `json:"children"`
	Status   string           `json:"status"`
	CRUDMode string           `json:"CRUDMode"`
}

func (item ItemWebResult) ConvertToParam() *domain.Space {
	space := new(domain.Space)
	space.SetID(item.ID)
	space.SetTitle(item.Title)
	space.SetText(item.Text)
	space.SetState(item.State)
	space.SetStatus(item.Status)
	space.SetCRUDMode(item.CRUDMode)
	spaces := new(domain.Spaces)
	itemChildren := item.Children
	for _, itemChild := range itemChildren {
		spaces.AddSpace(itemChild.ConvertToParam())
	}
	space.SetChildrenSpaces(spaces)
	return space
}

func ConvertSpaceToResponse(space domain.Space) *ItemWebResult {
	itemWebResult := new(ItemWebResult)
	itemWebResult.ID = space.GetId()
	itemWebResult.Title = space.GetTitle()
	itemWebResult.Text = space.GetText()
	itemWebResult.State = space.GetState()
	itemWebResult.Status = space.GetStatus()
	itemWebResult.CRUDMode = space.GetCRUDMode()
	foundChildren := space.GetChildren()
	children := make([]*ItemWebResult, len(foundChildren))
	for index, foundChild := range foundChildren {
		children[index] = ConvertItemToWebResult(foundChild)
	}
	itemWebResult.Children = children
	return itemWebResult
}

func ConvertItemToWebResult(item domain.Item) *ItemWebResult {
	itemWebResult := new(ItemWebResult)
	itemWebResult.ID = item.GetId()
	itemWebResult.Title = item.GetTitle()
	itemWebResult.Text = item.GetText()
	itemWebResult.State = item.GetState()
	itemWebResult.Status = item.GetStatus()
	itemWebResult.CRUDMode = item.GetCRUDMode()
	foundChildren := item.GetChildren()
	children := make([]*ItemWebResult, len(foundChildren))
	for index, foundChild := range foundChildren {
		children[index] = ConvertItemToWebResult(foundChild)
	}
	itemWebResult.Children = children
	return itemWebResult
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
