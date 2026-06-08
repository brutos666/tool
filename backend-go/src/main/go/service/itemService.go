package service

import (
	"goTool/entity"
	"goTool/repository"
)

func FindAll() ([]entity.Item, error) {
	itemsFromBase, err := repository.FindAll()
	if (err != nil) {
		return nil, err
	}
	// Conversion en arbre
	return convertToTree(itemsFromBase)
}

func convertToTree(itemsModel []entity.ItemModel) ([]entity.Item, error) {
	items := make([]entity.Item, 0)
	for _, itemModel := range itemsModel {
		if (itemModel.ParentID == -1) {
			items = append(items, itemModel.ConvertToItem())
		}
	}
	return items, nil
}