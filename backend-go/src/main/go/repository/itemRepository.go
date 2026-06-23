package repository

import (
	"context"
	"database/server/requestSQL"
	"log"

	"goTool/entity"

	"github.com/jmoiron/sqlx"
)

const (
	SELECT_ALL          string = "SELECT id, title, text, state, parent_id, next_id FROM item"
	DELETE_SQL          string = "DELETE FROM item WHERE id IN (?)"
	INSERT_SQL          string = "INSERT INTO item (title, text, state, parent_id) values(:title, :text, :state, :parent_id) RETURNING *"
	UPDATE_NEXT_ID      string = "UPDATE item SET next_id=? where id=? and coalesce(next_id, -666) !=?"
	UPDATE_NULL_NEXT_ID string = "UPDATE item SET next_id = null where id=? and next_id is not null"
	UPDATE_ITEM                = "UPDATE item SET title=:title, text=:text, state=:state, parent_id=:parent_id, next_id=:next_id where id=:id"
)

func FindAll(ctx context.Context) ([]entity.ItemModel, error) {
	var itemsModel []entity.ItemModel
	db := requestSQL.Open(BaseConnection)
	defer requestSQL.Close(db)
	err := requestSQL.Select(ctx, db, &itemsModel, SELECT_ALL)
	return itemsModel, err
}

/**
* Construit une liste d'objets stockant la référence de l'item, de son parent et de l'item suivant
* Une fois l'item créé dans la base de données, le nouvel identifiant est stocké.
* Ce n'est que lorsque toutes les créations modifications et suppressions se sont bien passées que l'on va mettre à jour
* les identifiants et l'état CRUDMode de l'item
 */
func Save(ctx context.Context, previousId int64, pItemNodes []*entity.ItemNode) error {
	var err error
	db := requestSQL.Open(BaseConnection)
	tx, err := requestSQL.SetModeTrans(db)
	if err != nil {
		return err
	}
	defer requestSQL.Close(db)
	defer requestSQL.Rollback(tx)

	pItemNodesToCreate, itemsIdToDelete := getItemsToModify(pItemNodes)
	err = deleteInBase(ctx, tx, itemsIdToDelete)
	if err != nil {
		return err
	}
	err = createInBase(ctx, tx, pItemNodesToCreate)
	if err != nil {
		return err
	}
	// Une fois les éléments créés, on peut mettre sereinement à jour les identifiants parent et suivant qui ont été stocké dans itemNode
	err = updateInBase(ctx, tx, previousId, pItemNodes)
	if err != nil {
		return err
	}
	tx.Commit()
	return nil
}

func deleteInBase(ctx context.Context, tx *sqlx.Tx, itemsIdToDelete []int64) error {
	var err error
	nbRows := 0
	if len(itemsIdToDelete) > 0 {
		nbRows, err = requestSQL.ExecIn(ctx, tx, DELETE_SQL, "ids", itemsIdToDelete)
		if err != nil {
			return err
		}
	}
	log.Println("Nombre de lignes supprimées :", nbRows)
	return nil
}

func createInBase(ctx context.Context, tx *sqlx.Tx, pItemNodesToCreate []*entity.ItemNode) error {
	nbRows := 0
	for index, itemNode := range pItemNodesToCreate {
		itemModel := itemNode.ConvertToItemModel()
		err := requestSQL.ExecWithReturn(ctx, tx, itemModel, &itemModel, INSERT_SQL)
		if err != nil {
			return err
		}
		nbRows++
		pItemNodesToCreate[index].StoreChanges(itemModel)
	}
	log.Println("Nombre de lignes créées :", nbRows)
	return nil
}

func updateInBase(ctx context.Context, tx *sqlx.Tx, previousId int64, pItemNodes []*entity.ItemNode) error {
	nbNextIdRows := 0
	nbUpdated := 0
	nbNextIdUpdates, err := updatePreviousNextId(ctx, tx, previousId, *pItemNodes[0])
	if err != nil {
		return err
	}
	nbNextIdRows = nbNextIdRows + nbNextIdUpdates
	for _, itemNode := range pItemNodes {
		nbUpdates, nbNextIdUpdates, err := updateOneInBase(ctx, tx, *itemNode)
		if err != nil {
			return err
		}
		nbNextIdRows = nbNextIdRows + nbNextIdUpdates
		nbUpdated = nbUpdated + nbUpdates
	}
	log.Println(nbUpdated, "lignes modifiées ou déplacées,", nbNextIdRows, "identifiants ligne suivante mis à jour")
	return nil
}

func updateOneInBase(ctx context.Context, tx *sqlx.Tx, itemNode entity.ItemNode) (nbUpdates int, nbNextIdUpdates int, err error) {
	nbUpdates = 0
	nbNextIdUpdates = 0
	if itemNode.IsToUpdate() {
		itemModel := itemNode.ConvertToItemModel()
		nbUpdates, err = requestSQL.Exec(ctx, tx, UPDATE_ITEM, itemModel)
	} else if !itemNode.IsToDelete() {
		nbNextIdUpdates, err = updateNextId(ctx, tx, itemNode)
	}
	return nbUpdates, nbNextIdUpdates, err
}

func updateNextId(ctx context.Context, tx *sqlx.Tx, itemNode entity.ItemNode) (nbNextIdUpdates int, err error) {
	id := itemNode.GetStoredId()
	pNextId := itemNode.GetNextId()
	if pNextId.IsNull() {
		nbNextIdUpdates, err = requestSQL.ExecArgs(ctx, tx, UPDATE_NULL_NEXT_ID, id)
	} else {
		nextId := pNextId.GetValue()
		nbNextIdUpdates, err = requestSQL.ExecArgs(ctx, tx, UPDATE_NEXT_ID, nextId, id, nextId)
	}
	if nbNextIdUpdates > 0 {
		log.Printf("Identifiant ligne suivante de l'item '%v' (%v) a été mis à jour", itemNode.GetItem().GetTitle(), id)
	}
	return nbNextIdUpdates, err
}

func updatePreviousNextId(ctx context.Context, tx *sqlx.Tx, previousId int64, itemNextNode entity.ItemNode) (nbNextIdUpdates int, err error) {
	id := previousId
	nextId := itemNextNode.GetStoredId()
	nbNextIdUpdates, err = requestSQL.ExecArgs(ctx, tx, UPDATE_NEXT_ID, nextId, id, nextId)
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
