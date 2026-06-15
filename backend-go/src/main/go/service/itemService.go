package service

import (
	"goTool/entity"
	"goTool/repository"
	"maps"
	"slices"
)

func FindAll() ([]entity.Item, error) {
	itemsFromBase, err := repository.FindAll()
	if (err != nil) {
		return nil, err
	}
	// Conversion en arbre
	return convertToTree(itemsFromBase), nil
}

func Save(treeInfos entity.TreeInfos) (entity.TreeInfos, error) {
	// Construction de la liste des références aux items
	pItemNodes := entity.ConvertItemToItemsNode(treeInfos.GetItem(), treeInfos.GetPreviousItemId(), treeInfos.GetParentItemId(), treeInfos.GetNextItemId())
	err := repository.Save(treeInfos.GetPreviousItemId(), pItemNodes)
	if (err != nil) {
		return treeInfos, err
	}
	// Si tout s'est bien passé, on met à jour les références
	removeDeletedItems(treeInfos.GetItem())
	applyModification(pItemNodes)
	return treeInfos, nil
}

func convertToTree(itemsModel []entity.ItemModel) []entity.Item {
	groupedByParent := getItemsModelGroupByParent(itemsModel)
	// Trier les enfants directs entre eux
	sortedItems := make(map[int64][]entity.Item);
	for key, itemsModel := range groupedByParent {
		sortedItems[key] = sortSameParentItems(itemsModel)
	}
	return getChildren(-1, sortedItems);
}

func getChildren(IdKey int64, sortedItems map[int64][]entity.Item) []entity.Item {
	children := sortedItems[IdKey]
	if (children == nil) {
		return []entity.Item {}
	}
	for index, item := range children {
		children[index].SetChildren(getChildren(item.GetId(), sortedItems))
	}
	return children
}

func sortSameParentItems(itemsModel []entity.ItemModel) []entity.Item{
	nbItems := len(itemsModel) 
	if nbItems == 1 {
		return []entity.Item{ itemsModel[0].ConvertToItem() }
	}
	nextIds := make([]int64, nbItems)
	itemModelById := make(map[int64]entity.ItemModel, nbItems)
	for index, itemModel := range itemsModel {
		nextIds[index] = itemModel.GetNextIdValue()
		itemModelById[itemModel.GetId()] = itemModel
	}
	ids := slices.Sorted(maps.Keys(itemModelById))

	firstIds := make([]int64, 0)
	sortedItems := make([]entity.Item, 0)
	items := make([]entity.Item, 0)
	for _, itemModel := range itemsModel {
		id := itemModel.GetId()
		if (!slices.Contains(nextIds, id)) {
			items, ids = process(itemModelById, id, ids)
			sortedItems = append(sortedItems, items...)
			firstIds = append(firstIds, id)
		}
	}
	if (len(firstIds) > 1) {
		// Il ne peut y avoir qu'un seul premier. Dans le cas contraire, il faut marquer les éléments comme incorrecte
		for index, item := range sortedItems {
			if (slices.Contains(firstIds, item.GetId())) {
				sortedItems[index].SetOrphan()
			}
		}
	}
	for (len(ids) > 0) {
			// Ici il y a probablement une ou plusieurs boucles
			id := ids[0];
			items, ids = process(itemModelById, id, ids);
			sortedItems = append(sortedItems, items...)
	}
	return sortedItems
}

func process(itemModelById map[int64]entity.ItemModel, id int64, ids []int64) ([]entity.Item, []int64){
	sortedItems := make([]entity.Item, 0)
	sortedIds := make([]int64, 0)
	currentItem := itemModelById[id]
	// Si l'identifiant n'existe pas en tant que suivant, alors il s'agit du 1er. On va construire
	// la liste ordonnée à partir du 1er en recherchant les suivants
	for {
		sortedItems = append(sortedItems, currentItem.ConvertToItem())
		sortedIds = append(sortedIds, currentItem.GetId())
		ids = slices.DeleteFunc(ids, func (value int64) bool {
			return value == currentItem.GetId()
		})
		if (currentItem.IsNextIdNull()) {
			break
		}
		nextId := currentItem.GetNextIdValue()
		if (!slices.Contains(ids, nextId)) {
			if (nextId != 0) {
				if (slices.Contains(sortedIds, nextId)) {
					// S'il existe dans la liste, alors il s'agit d'une boucle
					sortedItems[len(sortedItems)-1].SetLoop()
				} else {
					sortedItems[len(sortedItems)-1].SetNextNotFound()
				}
			}
			break
		}
		currentItem = itemModelById[nextId]
	} 
	return sortedItems, ids
}

func getItemsModelGroupByParent(itemsModel []entity.ItemModel) (map[int64][]entity.ItemModel){
	itemsModelGroupByParent := make(map[int64][]entity.ItemModel)
	var items []entity.ItemModel
	for _, itemModel := range itemsModel {
		parentId := itemModel.GetParentId()
		items = itemsModelGroupByParent[parentId]
		if (items == nil) {
			items = make([]entity.ItemModel, 0)
		}
		itemsModelGroupByParent[parentId] = append(items, itemModel)
	}
	return itemsModelGroupByParent
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