package controller

import (
	"goTool/entity"
	"goTool/service"
)

func FindAllItems() ([]entity.ItemWebResult, error) {
	itemsWebResult := []entity.ItemWebResult {}
	//itemsFromBase, _, err := repository.FindAll()
	itemsFromBase, err := service.FindAll()
	if (err != nil) {
		return nil, err
	}
	for _, item := range itemsFromBase {
		itemsWebResult = append(itemsWebResult, item.ConvertToWebResult())
	}
	return itemsWebResult, nil
}
