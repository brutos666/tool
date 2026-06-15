package controller

import (
	"goTool/entity"
	"goTool/service"
)

func FindAllItems() ([]entity.ItemWebResult, error) {
	itemsWebResult := []entity.ItemWebResult {}
	itemsFromBase, err := service.FindAll()
	if (err != nil) {
		return nil, err
	}
	for _, item := range itemsFromBase {
		itemsWebResult = append(itemsWebResult, item.ConvertToWebResult())
	}
	return itemsWebResult, nil
}

func SaveTreeItem(treeInfosWebResult entity.TreeInfosWebResult) (entity.TreeInfosWebResult, error) {
	result, err := service.Save(treeInfosWebResult.ConvertToTreeInfos())
	return result.ConvertToTreeInfosWebResult(), err
}
