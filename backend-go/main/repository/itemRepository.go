package repository

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"log"

	"goTool/entity"
)

const (
	SELECT_ALL          string = "SELECT id, title, text, state, parent_id, next_id FROM item"
	DELETE_SQL          string = "DELETE FROM item WHERE id IN (?)"
	INSERT_SQL          string = "INSERT INTO item (title, text, state, parent_id) values(:title, :text, :state, :parent_id) RETURNING *"
	UPDATE_NEXT_ID      string = "UPDATE item SET next_id=? where id=? and coalesce(next_id, -666) !=?"
	UPDATE_NULL_NEXT_ID string = "UPDATE item SET next_id = null where id=? and next_id is not null"
	UPDATE_ITEM                = "UPDATE item SET title=:title, text=:text, state=:state, parent_id=:parent_id, next_id=:next_id where id=:id"
)

type itemArgs struct {
	previousId int64
	pItemNodes []*entity.ItemNode
}

func FindAll(ctx context.Context) ([]entity.ItemModel, error) {
	return connection.LaunchNormalWay(ctx, BaseConnection, selectAllItems, "")
}

func selectAllItems(connection connection.Connection, notUsed string) ([]entity.ItemModel, error) {
	var itemsModel []entity.ItemModel
	err := requestSQL.Select(connection, &itemsModel, SELECT_ALL)
	if err != nil {
		return nil, err
	}
	return itemsModel, nil
}

/**
* Construit une liste d'objets stockant la référence de l'item, de son parent et de l'item suivant
* Une fois l'item créé dans la base de données, le nouvel identifiant est stocké.
* Ce n'est que lorsque toutes les créations modifications et suppressions se sont bien passées que l'on va mettre à jour
* les identifiants et l'état CRUDMode de l'item
 */
func Save(ctx context.Context, previousId int64, pItemNodes []*entity.ItemNode) error {
	_, err := connection.LaunchTransactionnelWay(ctx, BaseConnection, saveAllItems, itemArgs{previousId, pItemNodes})
	return err
}

func saveAllItems(connection connection.Connection, args itemArgs) ([]entity.ItemModel, error) {
	previousId := args.previousId
	pItemNodes := args.pItemNodes
	pItemNodesToCreate, itemsIdToDelete := getItemsToModify(pItemNodes)
	err := deleteInBase(connection, itemsIdToDelete)
	if err != nil {
		return nil, err
	}
	err = createInBase(connection, pItemNodesToCreate)
	if err != nil {
		return nil, err
	}
	// Une fois les éléments créés, on peut mettre sereinement à jour les identifiants parent et suivant qui ont été stocké dans itemNode
	err = updateInBase(connection, previousId, pItemNodes)
	if err != nil {
		return nil, err
	}
	return nil, nil
}

func deleteInBase(connection connection.Connection, itemsIdToDelete []int64) error {
	var err error
	nbRows := 0
	if len(itemsIdToDelete) > 0 {
		nbRows, err = requestSQL.ExecIn(connection, DELETE_SQL, itemsIdToDelete)
		if err != nil {
			return err
		}
	}
	log.Println("Nombre de lignes supprimées :", nbRows)
	return nil
}

func createInBase(connection connection.Connection, pItemNodesToCreate []*entity.ItemNode) error {
	nbRows := 0
	for index, itemNode := range pItemNodesToCreate {
		itemModel := itemNode.ConvertToItemModel()
		err := requestSQL.ExecWithReturn(connection, itemModel, &itemModel, INSERT_SQL)
		if err != nil {
			return err
		}
		nbRows++
		pItemNodesToCreate[index].StoreChanges(itemModel)
	}
	log.Println("Nombre de lignes créées :", nbRows)
	return nil
}

func updateInBase(connection connection.Connection, previousId int64, pItemNodes []*entity.ItemNode) error {
	nbNextIdRows := 0
	nbUpdated := 0
	nbNextIdUpdates, err := updatePreviousNextId(connection, previousId, *pItemNodes[0])
	if err != nil {
		return err
	}
	nbNextIdRows = nbNextIdRows + nbNextIdUpdates
	for _, itemNode := range pItemNodes {
		nbUpdates, nbNextIdUpdates, err := updateOneInBase(connection, *itemNode)
		if err != nil {
			return err
		}
		nbNextIdRows = nbNextIdRows + nbNextIdUpdates
		nbUpdated = nbUpdated + nbUpdates
	}
	log.Println(nbUpdated, "lignes modifiées ou déplacées,", nbNextIdRows, "identifiants ligne suivante mis à jour")
	return nil
}

func updateOneInBase(connection connection.Connection, itemNode entity.ItemNode) (nbUpdates int, nbNextIdUpdates int, err error) {
	nbUpdates = 0
	nbNextIdUpdates = 0
	if itemNode.IsToUpdate() {
		itemModel := itemNode.ConvertToItemModel()
		nbUpdates, err = requestSQL.Exec(connection, UPDATE_ITEM, itemModel)
	} else if !itemNode.IsToDelete() {
		nbNextIdUpdates, err = updateNextId(connection, itemNode)
	}
	return nbUpdates, nbNextIdUpdates, err
}

func updateNextId(connection connection.Connection, itemNode entity.ItemNode) (nbNextIdUpdates int, err error) {
	id := itemNode.GetStoredId()
	pNextId := itemNode.GetNextId()
	if pNextId.IsNull() {
		nbNextIdUpdates, err = requestSQL.ExecArgs(connection, UPDATE_NULL_NEXT_ID, id)
	} else {
		nextId := pNextId.GetValue()
		nbNextIdUpdates, err = requestSQL.ExecArgs(connection, UPDATE_NEXT_ID, nextId, id, nextId)
	}
	if nbNextIdUpdates > 0 {
		log.Printf("Identifiant ligne suivante de l'item '%v' (%v) a été mis à jour", itemNode.GetItem().GetTitle(), id)
	}
	return nbNextIdUpdates, err
}

func updatePreviousNextId(connection connection.Connection, previousId int64, itemNextNode entity.ItemNode) (nbNextIdUpdates int, err error) {
	id := previousId
	nextId := itemNextNode.GetStoredId()
	nbNextIdUpdates, err = requestSQL.ExecArgs(connection, UPDATE_NEXT_ID, nextId, id, nextId)
	if nbNextIdUpdates > 0 {
		log.Printf("L'item précédent de l'item '%v' (%v) a été mis à jour", itemNextNode.GetItem().GetTitle(), id)
	}
	return nbNextIdUpdates, err
}

func getItemsToModify(pItemNodes []*entity.ItemNode) (pItemNodesToCreate []*entity.ItemNode, itemsIdToDelete []int64) {
	pItemNodesToCreate = make([]*entity.ItemNode, 0)
	itemsIdToDelete = make([]int64, 0)
	for index, itemNode := range pItemNodes {
		if itemNode.IsToCreate() {
			pItemNodesToCreate = append(pItemNodesToCreate, pItemNodes[index])
		} else if itemNode.IsToDelete() {
			itemsIdToDelete = append(itemsIdToDelete, itemNode.GetStoredId())
		}
	}
	return pItemNodesToCreate, itemsIdToDelete
}
