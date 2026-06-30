package service

import (
	"context"

	"goTool/entity"
	"goTool/mapper"
	"goTool/repository"
)

func FindAll(ctx context.Context) ([]entity.Item, error) {
	itemsFromBase, err := repository.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	// Conversion en arbre
	return mapper.ConvertItemsModelToItems(itemsFromBase), nil
}

func Save(ctx context.Context, treeInfos entity.TreeInfos) (entity.TreeInfos, error) {
	// Construction de la liste des références aux items
	pItemNodes := entity.ConvertItemToItemsNode(treeInfos.GetItem(), treeInfos.GetParentItemId(), treeInfos.GetNextItemId())
	err := repository.Save(ctx, treeInfos.GetPreviousItemId(), pItemNodes)
	if err != nil {
		return treeInfos, err
	}
	// Si tout s'est bien passé, on met à jour les références
	removeDeletedItems(treeInfos.GetItem())
	applyModification(pItemNodes)
	return treeInfos, nil
}

func removeDeletedItems(pItem *entity.Item) {
	children := pItem.RemoveDeletedChildren()
	for index := range children {
		removeDeletedItems(&children[index])
	}
}

func applyModification(pItemNodes []*entity.ItemNode) {
	for index := range pItemNodes {
		pItemNodes[index].Apply()
	}
}
