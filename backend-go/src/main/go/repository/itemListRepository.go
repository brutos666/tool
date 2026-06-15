package repository

import (
	"database/server/requestSQL"
	"goTool/entity"
	"log"

	"github.com/jmoiron/sqlx"
)

const SELECT_ALL string = "SELECT id, title, text, state, parent_id, next_id FROM item"
const DELETE_SQL string = "DELETE FROM item WHERE id IN (?)"
const INSERT_SQL string = "INSERT INTO item (title, text, state, parent_id) values(:title, :text, :state, :parent_id) RETURNING *"
const UPDATE_NEXT_ID string = "UPDATE item SET next_id=? where id=? and coalesce(next_id, -666) !=?"
const UPDATE_NULL_NEXT_ID string = "UPDATE item SET next_id = null where id=? and next_id is not null"
const UPDATE_ITEM="UPDATE item SET title=:title, text=:text, state=:state, parent_id=:parent_id, next_id=:next_id where id=:id"

func FindAll() ([]entity.ItemModel, error) {
	var itemsModel []entity.ItemModel
    db := requestSQL.Open(baseConnection)
	defer requestSQL.Close(db)
	err := requestSQL.Select(db, &itemsModel, SELECT_ALL)
	return itemsModel, err
}
/**
* Construit une liste d'objets stockant la référence de l'item, de son parent et de l'item suivant
* Une fois l'item créé dans la base de données, le nouvel identifiant est stocké.
* Ce n'est que lorsque toutes les créations modifications et suppressions se sont bien passées que l'on va mettre à jour
* les identifiants et l'état CRUDMode de l'item
*/
func Save(previousId int64, pItemNodes []*entity.ItemNode) (error) {
    var err error
    db := requestSQL.Open(baseConnection)
    tx, err := requestSQL.SetModeTrans(db)
    if (err != nil) {
        return err
    }
    defer requestSQL.Close(db)
    defer requestSQL.Rollback(tx)

	pItemNodesToCreate, itemsIdToDelete := getItemsToModify(pItemNodes)
    err = deleteInBase(tx, itemsIdToDelete)
    if (err != nil) {
        return err
    }
    err = createInBase(tx, pItemNodesToCreate)
    if (err != nil) {
        return err
    }
    // Une fois les éléments créés, on peut mettre sereinement à jour les identifiants parent et suivant qui ont été stocké dans itemNode
    err = updateInBase(tx, pItemNodes)
    if (err != nil) {
        return err
    }
    tx.Commit()
    return nil
}

func deleteInBase(tx *sqlx.Tx, itemsIdToDelete []int64) (error) {
    if (len(itemsIdToDelete) == 0) {
        return nil
    }
    nbRows, err := requestSQL.ExecIn(tx, DELETE_SQL, "ids", itemsIdToDelete)
    if (err != nil) {
        return err
    }
    log.Println("Nombre de lignes supprimées :", nbRows)
    return nil
}

func createInBase(tx *sqlx.Tx, pItemNodesToCreate []*entity.ItemNode) (error) {
    nbRows := 0
    for index, itemNode := range pItemNodesToCreate {
        itemModel := itemNode.ConvertToItemModel()
        err := requestSQL.ExecWithReturn(tx, itemModel, &itemModel, INSERT_SQL)
        if (err != nil) {
            return err
        }
        nbRows++
        pItemNodesToCreate[index].StoreChanges(itemModel)
    }
    log.Println("Nombre de lignes créées :", nbRows)
    return nil
}

func updateInBase(tx *sqlx.Tx, pItemNodes []*entity.ItemNode) (error) {
    nbNextIdRows := 0
    nbUpdated := 0
    for _, itemNode := range pItemNodes {
        nbUpdates, nbNextIdUpdates, err := updateOneInBase(tx, *itemNode)
        if (err != nil) {
            return err
        }
        nbNextIdRows = nbNextIdRows + nbNextIdUpdates
        nbUpdated = nbUpdated + nbUpdates 
    }
    log.Println(nbUpdated, "lignes modifiées ou déplacées,", nbNextIdRows, "identifiants ligne suivante mis à jour")
    return nil
}

func updateOneInBase(tx *sqlx.Tx, itemNode entity.ItemNode) (nbUpdates int, nbNextIdUpdates int, err error) {
    nbUpdates = 0
    nbNextIdUpdates = 0
    if (itemNode.IsToUpdate()) {
        itemModel := itemNode.ConvertToItemModel()
        nbUpdates, err = requestSQL.Exec(tx, UPDATE_ITEM, itemModel)
    } else if (!itemNode.IsToDelete()) {
        nbNextIdUpdates, err = updateNextId(tx, itemNode)
    }
    return nbUpdates, nbNextIdUpdates, err
}
func updateNextId(tx *sqlx.Tx, itemNode entity.ItemNode) (nbNextIdUpdates int, err error) {
    id := itemNode.GetStoredId()
    if (itemNode.HasNext()) {
        nextId := itemNode.GetNextId()
        nbNextIdUpdates, err = requestSQL.ExecArgs(tx, UPDATE_NEXT_ID, nextId, id, nextId)
    } else {
        nbNextIdUpdates, err = requestSQL.ExecArgs(tx, UPDATE_NULL_NEXT_ID, id)
    }
    if (nbNextIdUpdates > 0) {
        log.Printf("Identifiant ligne suivante de l'item '%v' (%v) a été mis à jour", itemNode.GetItem().GetTitle(), id)
    }
    return nbNextIdUpdates, err
}
/*

    public TreeInfos saveTreeItem(TreeInfos treeInfos) {

        Tree<Item> treeItem = treeInfos.getTreeItem();
        // Traiter les suppressions et les créations en premiers
        List<Item> itemsToDelete = TreeUtils.applyFilter(treeItem, item -> item.getCRUDMode() == CRUDMode.DELETE);
        if (!itemsToDelete.isEmpty()) {
            itemRepository.deleteAll(ItemMapper.toModel(itemsToDelete));
            TreeUtils.removeIf(treeItem, item -> item.getCRUDMode().isDelete());
        }
        List<Item> itemsToCreate = TreeUtils.applyFilter(treeItem, item -> item.getCRUDMode() == CRUDMode.CREATE);
        if (!itemsToCreate.isEmpty()) {
            Iterable<ItemModel> itemsCreated = itemRepository.saveAll(ItemMapper.toModel(itemsToCreate));
            updateTreeItemIds(itemsToCreate, itemsCreated);
        }
        // Parcours de l'arbre afin de fournir la liste des itemModels : tous les itemModels sont pris en compte même
        // s'il n'y a pas eu de modification
        List<ItemModel> itemsToModify = getAllItemsToModify(treeInfos);
        if (treeInfos.getPreviousItemId() != null) {
            addFirstPrevious(treeInfos, itemsToModify);
        }
        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(itemsToModify);
        Iterator<ItemModel> iterator = modifiedItems.iterator();
        if (treeInfos.getPreviousItemId() != null) {
            // Retirer le précédent de la liste
            removeFirstPrevious(iterator);
        }

        List<ItemModel> itemModels = new ArrayList<>();
        iterator.forEachRemaining(itemModels::add);
        Tree<Item> savedTreeItem = TreeUtils.transformToTree(itemModels, ItemMapper::toEntity);
        return new TreeInfos(savedTreeItem, treeInfos.getPreviousItemId(), treeInfos.getParentItemId(), treeInfos.getNextItemId());
    }
*/
func getItemsToModify(pItemNodes []*entity.ItemNode) (pItemNodesToCreate []*entity.ItemNode, itemsIdToDelete []int64) {
	pItemNodesToCreate = make([]*entity.ItemNode, 0)
	itemsIdToDelete = make([]int64, 0)
    for index, itemNode := range pItemNodes {
        if (itemNode.IsToCreate()) {
            pItemNodesToCreate = append(pItemNodesToCreate, pItemNodes[index])
        } else if (itemNode.IsToDelete()) {
            itemsIdToDelete = append(itemsIdToDelete, itemNode.GetStoredId())
        }
    }
	return pItemNodesToCreate, itemsIdToDelete
}