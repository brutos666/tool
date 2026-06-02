package controller

import (
	"goTool/entity"
	"goTool/repository"
)

func FindAllItems() ([]entity.ItemWebResult, error) {
	itemsWebResult := []entity.ItemWebResult {}
	itemsFromBase := repository.FindAll()
	for _, item := range itemsFromBase {
		itemsWebResult = append(itemsWebResult, convertItemToWebResult(item))
	}
	return itemsWebResult, nil
}

func convertItemToWebResult(item entity.Item) entity.ItemWebResult {
		var itemWebResult entity.ItemWebResult
		itemWebResult.ID = item.ID
		itemWebResult.Title = item.Title
		itemWebResult.Text = item.Text
		itemWebResult.State = item.State
		itemWebResult.Status = item.Status
		itemWebResult.ParentID = item.ParentID
		children := []entity.ItemWebResult{}
		for _, child := range item.Children {
			children = append(children, convertItemToWebResult(child))
		}
		itemWebResult.Children = children
		return itemWebResult
}