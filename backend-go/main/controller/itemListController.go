package controller

import (
	"context"

	"goTool/entity"
	"goTool/service"
)

func FindAllItems(ctx context.Context) ([]entity.ItemWebResult, error) {
	itemsWebResult := []entity.ItemWebResult{}
	itemsFromBase, err := service.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	for _, item := range itemsFromBase {
		itemsWebResult = append(itemsWebResult, item.ConvertToWebResult())
	}
	return itemsWebResult, nil
}

func SaveTreeItem(ctx context.Context, treeInfosWebResult entity.TreeInfosWebResult) (entity.TreeInfosWebResult, error) {
	result, err := service.Save(ctx, treeInfosWebResult.ConvertToTreeInfos())
	return result.ConvertToTreeInfosWebResult(), err
}
