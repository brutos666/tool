// Package bdd interface avec la base de données. Ce package connaît tout ce qui vient de "domain"
package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"log"

	"goTool/domain"
	"goTool/infrastructure/configuration"
	"goTool/infrastructure/itemBdd"
)

type itemCmdRepository struct{}

const (
	INSERT_SQL           string = "INSERT INTO item (title, text, state, parent_id, next_id) values(:title, :text, :state, :parent_id, :next_id) RETURNING *"
	UPDATE_NEXT_SQL      string = "UPDATE item SET next_id=? where id=? and coalesce(next_id, -666) !=?"
	UPDATE_NEXT_NULL_SQL string = "UPDATE item SET next_id = null where id=? and next_id is not null"
	UPDATE_SQL                  = "UPDATE item SET title=:title, text=:text, state=:state, parent_id=:parent_id, next_id=:next_id where id=:id"
	DELETE_SQL           string = "DELETE FROM item WHERE id IN (?)"
)

func ItemCommandRepository() domain.ItemCommandRepository {
	return &itemCmdRepository{}
}

func (repo *itemCmdRepository) SaveCurrentSpace(ctx context.Context, nodeSpace *domain.NodeSpace) error {
	return connection.LaunchTransactionnel(ctx, configuration.BaseConnection, saveSpace, nodeSpace)
}

func (repo *itemCmdRepository) SaveSpaces(ctx context.Context, spaces *domain.Spaces) error {
	return connection.LaunchTransactionnel(ctx, configuration.BaseConnection, saveSpaces, spaces)
}

func saveSpace(connection connection.Connection, nodeSpace *domain.NodeSpace) error {
	err := deleteInBase(connection, nodeSpace.GetSpace())
	if err != nil {
		return err
	}
	err = createInBase(connection, nodeSpace)
	if err != nil {
		return err
	}
	// Une fois les éléments créés, on peut mettre sereinement à jour les modifications en récupérant les nouveaux identifiants
	return updateInBase(connection, nodeSpace)
}

func saveSpaces(connection connection.Connection, spaces *domain.Spaces) error {
	nbRows, err := deleteSpaces(connection, spaces.GetDeleteIds())
	if err != nil {
		return err
	}
	log.Println("Nombre de lignes supprimées :", nbRows)

	nbRows, err = createSpacesInBase(connection, spaces, domain.ROOT_ID)
	if err != nil {
		return err
	}
	log.Println("Nombre de lignes créées :", nbRows)
	// Une fois les éléments créés, on peut mettre sereinement à jour les modifications en récupérant les nouveaux identifiants
	nbUpdated, nbNextIdUpdated, err := updateSpacesInBase(connection, spaces, domain.ROOT_ID)
	if err != nil {
		return err
	}
	log.Println(nbUpdated, "lignes modifiées ou déplacées,", nbNextIdUpdated, "identifiants ligne suivante mis à jour")
	return nil
}

func deleteInBase(connection connection.Connection, space *domain.Space) error {
	nbRows, err := deleteSpaces(connection, space.GetDeleteIds())
	if err != nil {
		return err
	}
	log.Println("Nombre de lignes supprimées :", nbRows)
	return nil
}

func createInBase(connection connection.Connection, nodeSpace *domain.NodeSpace) error {
	nbRows, err := createTreeInBase(connection, nodeSpace.GetSpace(), nodeSpace.GetParentId(), nodeSpace.GetNextId())
	if err != nil {
		return err
	}
	log.Println("Nombre de lignes créées :", nbRows)
	return nil
}

func updateInBase(connection connection.Connection, nodeSpace *domain.NodeSpace) error {
	space := nodeSpace.GetSpace()
	previousUpdated, err := updatePreviousNextId(connection, space, nodeSpace.GetPreviousId())
	if err != nil {
		return err
	}
	nbUpdated, nbNextIdUpdated, err := updateTreeInBase(connection, space, nodeSpace.GetParentId(), nodeSpace.GetNextId())
	if err != nil {
		return err
	}
	if previousUpdated {
		nbNextIdUpdated++
	}
	log.Println(nbUpdated, "lignes modifiées ou déplacées,", nbNextIdUpdated, "identifiants ligne suivante mis à jour")
	return nil
}

func createTreeInBase(connection connection.Connection, space *domain.Space, parentId, nextId string) (int, error) {
	nbCreated := 0
	if space.IsToCreate() {
		err := createSpace(connection, space, parentId, nextId)
		if err != nil {
			return 0, err
		}
		nbCreated++
	}
	nbChildCreation, err := createSpacesInBase(connection, space.GetChildrenSpaces(), space.GetCurrentId())
	if err != nil {
		return 0, err
	}
	nbCreated += nbChildCreation
	return nbCreated, nil
}

func createSpacesInBase(connection connection.Connection, spaces *domain.Spaces, parentId string) (int, error) {
	nbCreated := 0
	listOfSpaces := spaces.GetList()
	nextId := ""
	for index := len(listOfSpaces) - 1; index >= 0; index-- {
		space := listOfSpaces[index]
		nbSpaceCreation, err := createTreeInBase(connection, space, parentId, nextId)
		if err != nil {
			return 0, err
		}
		if !space.IsToDelete() {
			nextId = space.GetCurrentId()
		}
		nbCreated += nbSpaceCreation
	}
	return nbCreated, nil
}

func updateTreeInBase(connection connection.Connection, space *domain.Space, parentId, nextId string) (int, int, error) {
	nbUpdated := 0
	nbNextIdUpdated := 0
	if space.IsToUpdate() {
		updated, err := updateSpace(connection, space, parentId, nextId)
		if err != nil {
			return 0, 0, err
		}
		if updated {
			nbUpdated++
		}
	} else if !space.IsToDelete() {
		updated, err := updateNextId(connection, space, nextId)
		if err != nil {
			return 0, 0, err
		}
		if updated {
			nbNextIdUpdated++
		}
	}
	nbChildUpdated, nbChildNextIdUpdated, err := updateSpacesInBase(connection, space.GetChildrenSpaces(), space.GetCurrentId())
	if err != nil {
		return 0, 0, err
	}
	nbUpdated += nbChildUpdated
	nbNextIdUpdated += nbChildNextIdUpdated
	return nbUpdated, nbNextIdUpdated, nil
}

func updateSpacesInBase(connection connection.Connection, spaces *domain.Spaces, parentId string) (int, int, error) {
	nbUpdated := 0
	nbNextIdUpdated := 0
	listOfSpaces := spaces.GetList()
	nextId := ""
	for index := len(listOfSpaces) - 1; index >= 0; index-- {
		space := listOfSpaces[index]
		nbSpaceUpdated, nbSpaceNextIdUpdated, err := updateTreeInBase(connection, space, parentId, nextId)
		if err != nil {
			return 0, 0, err
		}
		if !space.IsToDelete() {
			nextId = space.GetCurrentId()
		}
		nbUpdated += nbSpaceUpdated
		nbNextIdUpdated += nbSpaceNextIdUpdated
	}
	return nbUpdated, nbNextIdUpdated, nil
}

func deleteSpaces(connection connection.Connection, itemsIdToDelete []string) (int, error) {
	if len(itemsIdToDelete) > 0 {
		return requestSQL.ExecIn(connection, DELETE_SQL, itemsIdToDelete)
	}
	return 0, nil
}

func createSpace(connection connection.Connection, space *domain.Space, parentId, nextId string) error {
	itemModel := *itemBdd.ConvertSpaceToItemModel(*space, parentId, nextId)
	err := requestSQL.ExecWithReturn(connection, itemModel, &itemModel, INSERT_SQL)
	if err != nil {
		return err
	}
	space.Save(itemModel.GetId())
	return nil
}

// updateSpace : modification d'un espace. Retourne une erreur si la requête échoue. Retourne true si la requête a modifié
// l'espace
func updateSpace(connection connection.Connection, space *domain.Space, parentId, nextId string) (bool, error) {
	itemModel := itemBdd.ConvertSpaceToItemModel(*space, parentId, nextId)
	nbUpdates, err := requestSQL.Exec(connection, UPDATE_SQL, itemModel)
	if err != nil {
		return false, err
	}
	if nbUpdates == 0 {
		return false, nil
	}
	return true, nil
}

// updatePreviousNextId : modification de l'identifiant suivant de l'espace précédent.
// Retourne une erreur si la requête échoue. Retourne true si la requête a modifié l'espace précédent
func updatePreviousNextId(connection connection.Connection, space *domain.Space, previousId string) (bool, error) {
	if len(previousId) == 0 {
		return false, nil
	}
	id := itemBdd.ConvertIdToBdd(previousId)
	nextIdBdd := itemBdd.GetCurrentBddId(space)
	nbNextIdUpdates, err := requestSQL.ExecArgs(connection, UPDATE_NEXT_SQL, nextIdBdd, id, nextIdBdd)
	if err != nil {
		return false, err
	}
	if nbNextIdUpdates == 0 {
		return false, nil
	}
	log.Printf("L'item précédent de l'item '%v' (%v) a été mis à jour", space.GetTitle(), id)
	return true, nil
}

func updateNextId(connection connection.Connection, space *domain.Space, nextId string) (bool, error) {
	var nbNextIdUpdated int
	var err error
	idBdd := itemBdd.GetCurrentBddId(space)
	if len(nextId) == 0 {
		nbNextIdUpdated, err = requestSQL.ExecArgs(connection, UPDATE_NEXT_NULL_SQL, idBdd)
	} else {
		nextBddId := itemBdd.ConvertIdToBdd(nextId)
		nbNextIdUpdated, err = requestSQL.ExecArgs(connection, UPDATE_NEXT_SQL, nextBddId, idBdd, nextBddId)
	}
	if err != nil {
		return false, err
	}
	if nbNextIdUpdated == 0 {
		return false, nil
	}
	log.Printf("Identifiant ligne suivante de l'item '%v' (%v) a été mis à jour", space.GetTitle(), idBdd)
	return true, nil
}
