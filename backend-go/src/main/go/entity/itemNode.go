/**
* Référence l'item, son parent et son suivant afin de faciliter les mises à jour en base de données
* En effet, en base, un item est défini par son identifiant, l'identifiant de son parent et l'identifiant de son suivant
 */
package entity

import "slices"

type storedItem struct {
	pItem *Item
	id int64
}
func (itemWithId storedItem) getItem() *Item { return itemWithId.pItem }
func (itemWithId storedItem) getId() int64 { return itemWithId.id }
func (itemWithId *storedItem) storeId(id int64) { itemWithId.id = id }
func (itemWithId *storedItem) storeItem(pItem *Item) { itemWithId.pItem = pItem }
func (itemWithId *storedItem) storeNullItem() { itemWithId.pItem = nil }

type ItemNode struct {
	pItemWithId *storedItem
	pParentWithId *storedItem
	pNextWithId *storedItem
}

func createStoredItem(pItem *Item) (*storedItem) {
	itemWithId := new(storedItem)
	itemWithId.storeItem(pItem)
	itemWithId.storeId(pItem.GetId())
	return itemWithId
}
func createStoreNilItem(id int64) (*storedItem) {
	itemWithId := new(storedItem)
	itemWithId.storeNullItem()
	itemWithId.storeId(id)
	return itemWithId
}

func createItemNode(pItemWithId *storedItem, pParentWithId *storedItem, pNextWithId *storedItem) (*ItemNode) {
	itemNode := new(ItemNode)
	itemNode.pItemWithId = pItemWithId
	itemNode.pParentWithId = pParentWithId
	itemNode.pNextWithId = pNextWithId
	return itemNode
}
func (itemNode ItemNode) GetItem() *Item { return itemNode.pItemWithId.getItem() }
func (itemNode ItemNode) IsToDelete() bool { return itemNode.GetItem().IsToDelete() }
func (itemNode ItemNode) IsToCreate() bool { return itemNode.GetItem().IsToCreate() }
func (itemNode ItemNode) IsToUpdate() bool { return itemNode.GetItem().IsToUpdate() }
func (itemNode ItemNode) GetStoredId() int64 { return itemNode.pItemWithId.getId() }
func (itemNode ItemNode) HasNext() bool { return itemNode.pNextWithId != nil }
func (itemNode ItemNode) GetNextId() int64 { return itemNode.pNextWithId.getId() }
func (itemNode *ItemNode) Apply() {
	itemNode.GetItem().SetID(itemNode.pItemWithId.getId())
	itemNode.GetItem().SetRead()
}
func (itemNode *ItemNode) StoreChanges(itemModel ItemModel) {
	itemNode.pItemWithId.storeId(itemModel.GetId())
}
func (itemNode ItemNode) ConvertToItemModel() ItemModel {
	var itemModel ItemModel
	item := itemNode.GetItem()
	if (itemNode.HasNext()) {
		itemModel = item.ConvertToItemModel(itemNode.pParentWithId.getId(), itemNode.pNextWithId.getId(), false)
	} else {
		itemModel = item.ConvertToItemModel(itemNode.pParentWithId.getId(), 0, true)
	}
	itemModel.SetId(itemNode.pItemWithId.getId())
	return itemModel
}
func ConvertItemToItemsNode(item *Item, previousId int64, parentId int64, nextId int64) ([]*ItemNode) {
	pPreviousItemId := createStoreNilItem(previousId)
	pItemId := createStoredItem(item)
	pParentItemId := createStoreNilItem(parentId)
	pNextItemId := createStoreNilItem(nextId)
	itemsNode := convertToItemsNode(pItemId, pParentItemId, pNextItemId)
	if (previousId != NULL_VALUE_ID) {
		previousItemNode := createItemNode(pPreviousItemId, pParentItemId, pItemId)
		return slices.Insert(itemsNode, 0, previousItemNode)
	}
	return itemsNode
}

func convertToItemsNode(pItemId *storedItem, pParentItemId *storedItem, pNextItemId *storedItem) ([]*ItemNode) {
    itemsNode := make([]*ItemNode, 0)
    itemsNode = append(itemsNode, createItemNode(pItemId, pParentItemId, pNextItemId))
    children := pItemId.getItem().GetChildren()
		var pNextValidItemId *storedItem
		// Cet index va permettre de conserver l'ordre naturel des enfants
		insertPosition := len(itemsNode)
		for index := len(children) - 1; index >= 0; index-- {
			pChildItemId := createStoredItem(&children[index])
			childItemsToModify := convertToItemsNode(pChildItemId, pItemId, pNextValidItemId)
      itemsNode = slices.Insert(itemsNode, insertPosition, childItemsToModify...)
			if (!pChildItemId.getItem().IsToDelete()) {
				pNextValidItemId = pChildItemId
			}
		}
    return itemsNode
}



