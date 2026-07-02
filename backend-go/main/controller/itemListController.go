package controller

import (
	"context"

	"goTool/entity"
	"goTool/service"
)

func SaveTreeItem(ctx context.Context, treeInfosWebResult entity.TreeInfosWebResult) (entity.TreeInfosWebResult, error) {
	result, err := service.Save(ctx, treeInfosWebResult.ConvertToTreeInfos())
	return result.ConvertToTreeInfosWebResult(), err
}
