package service

import (
	"goTool/entity"
	"goTool/repository"
	"goTool/utilities"
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
	groupedByParent := utilities.GroupBy(
		itemsModel, 
		func(itemModel entity.ItemModel) int64{ return itemModel.GetParentId() })
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
	var sortedItems []entity.Item
	allSortedItems := make([]entity.Item, 0)
	idsLeftToProcess, firstItemsIds, itemModelById := collectInformations(itemsModel)
	for _, firstId := range firstItemsIds {
		sortedItems, idsLeftToProcess = process(itemModelById, firstId, idsLeftToProcess)
		allSortedItems = append(allSortedItems, sortedItems...)
	}
	if (len(firstItemsIds) > 1) {
		// Il ne peut y avoir qu'un seul premier. Dans le cas contraire, il faut marquer les éléments comme orphelin
		for index, item := range allSortedItems {
			if (slices.Contains(firstItemsIds, item.GetId())) {
				allSortedItems[index].SetOrphan()
			}
		}
	}
	for (len(idsLeftToProcess) > 0) {
		// S'il reste des identifiants non traités, c'est probablement des boucles
		id := idsLeftToProcess[0];
		sortedItems, idsLeftToProcess = process(itemModelById, id, idsLeftToProcess);
		allSortedItems = append(allSortedItems, sortedItems...)
	}
	return allSortedItems
}

func collectInformations(itemsModel []entity.ItemModel) (allIds []int64, firstIds []int64, itemModelById map[int64]entity.ItemModel) {
	nbItems := len(itemsModel)
	allNextIds := make([]int64, nbItems)
	allIds = make([]int64, nbItems)
	itemModelById = make(map[int64]entity.ItemModel, nbItems)
	for index, itemModel := range itemsModel {
		allNextIds[index] = itemModel.GetNextIdValue()
		itemModelById[itemModel.GetId()] = itemModel
		allIds[index] = itemModel.GetId()
	}
	slices.Sort(allIds)
	firstIds = make([]int64, 0)
	for _, itemModel := range itemsModel {
		id := itemModel.GetId()
		if (isFirst(allNextIds, id)) {
			firstIds = append(firstIds, id)
		}
	}
	return
}
// Un item est le premier s'il n'existe pas en tant que suivant
func isFirst(allNextIds []int64, id int64) bool {
	return !slices.Contains(allNextIds, id)
}

/**
* Construit la liste des items à partir du 1er de la liste en recherchant les suivants
* itemModelById : Map dont la clé est l'identifiant et la valeur l'item issu de la base de données
* id : identifiant de l'item traité
* ids : liste des identifiants restant à traiter
* @return items triés. Si l'identifiant du suivant est incorrect, le status de l'item vaudra :
* 	- LOOP si l'item suivant est déjà dans les items triés
*		- NEXT_NOT_FOUND, si l'identifiant n'est pas trouvé
*/
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
		if (nextIdNotFound(ids, nextId)) {
			changeItemStatus(&sortedItems[len(sortedItems)-1], isLoop(sortedIds, nextId))
			break
		}
		currentItem = itemModelById[nextId]
	} 
	return sortedItems, ids
}
func nextIdNotFound(ids []int64, nextId int64) bool {
	return !slices.Contains(ids, nextId)
}
func isLoop(sortedIds []int64, nextId int64) bool {
	return slices.Contains(sortedIds, nextId)
}
func changeItemStatus(pItem *entity.Item, loop bool) {
	if (loop) {
		pItem.SetLoop()
	} else {
		pItem.SetNextNotFound()
	}
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