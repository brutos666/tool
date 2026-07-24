// Package bdd s'occupe de la recherche et la mise à jour des données en base.
// Ce package connaît le package "domain"
package bdd

import (
	"context"
	"log"

	"goTool/domain"
	"goTool/infrastructure/bddAccess"
	"goTool/infrastructure/entityBdd"
)

type spaceCmdRepository struct{}

const (
	INSERT_SQL           string = "INSERT INTO item (title, text, state, parent_id, next_id) values(:title, :text, :state, :parent_id, :next_id) RETURNING *"
	UPDATE_NEXT_SQL      string = "UPDATE item SET next_id=? where id=? and coalesce(next_id, -666) !=?"
	UPDATE_NEXT_NULL_SQL string = "UPDATE item SET next_id = null where id=? and next_id is not null"
	UPDATE_SQL                  = "UPDATE item SET title=:title, text=:text, state=:state, parent_id=:parent_id, next_id=:next_id where id=:id"
	DELETE_SQL           string = "DELETE FROM item WHERE id IN (?)"
)

func SpaceCommandRepository() domain.SpaceCommandRepository {
	return &spaceCmdRepository{}
}

func (repo *spaceCmdRepository) SaveCurrentSpace(ctx context.Context, dataAccessId int, nodeSpace *domain.NodeSpace) error {
	return saveSpace(ctx, bddAccessService.WriteAccess(dataAccessId), nodeSpace)
}

func (repo *spaceCmdRepository) SaveSpaces(ctx context.Context, dataAccessId int, spaces *domain.Spaces) error {
	return saveSpaces(ctx, bddAccessService.WriteAccess(dataAccessId), spaces)
}

func saveSpace(ctx context.Context, bddAccess bddAccess.WriteDataOperation, nodeSpace *domain.NodeSpace) error {
	err := deleteInBase(ctx, bddAccess, nodeSpace.GetSpace())
	if err != nil {
		return err
	}
	err = createInBase(ctx, bddAccess, nodeSpace)
	if err != nil {
		return err
	}
	// Une fois les éléments créés, on peut mettre sereinement à jour les modifications en récupérant les nouveaux identifiants
	return updateInBase(ctx, bddAccess, nodeSpace)
}

func saveSpaces(ctx context.Context, bddAccess bddAccess.WriteDataOperation, spaces *domain.Spaces) error {
	nbRows, err := deleteSpaces(ctx, bddAccess, spaces.GetDeleteIds())
	if err != nil {
		return err
	}
	if nbRows > 0 {
		log.Printf("%v lignes supprimées", nbRows)
	}

	nbRows, err = createSpacesInBase(ctx, bddAccess, spaces, domain.ROOT_ID)
	if err != nil {
		return err
	}
	if nbRows > 0 {
		log.Printf("%v lignes créées", nbRows)
	}
	// Une fois les éléments créés, on peut mettre sereinement à jour les modifications en récupérant les nouveaux identifiants
	nbUpdated, nbNextIdUpdated, err := updateSpacesInBase(ctx, bddAccess, spaces, domain.ROOT_ID)
	if err != nil {
		return err
	}
	if nbUpdated > 0 {
		log.Printf("%v lignes modifiées ou déplacées", nbUpdated)
	}
	if nbNextIdUpdated > 0 {
		log.Printf("%v identifiants ligne suivante mis à jour", nbNextIdUpdated)
	}
	return nil
}

func deleteInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space) error {
	nbRows, err := deleteSpaces(ctx, bddAccess, space.GetDeleteIds())
	if err != nil {
		return err
	}
	if nbRows > 0 {
		log.Printf("%v lignes supprimées", nbRows)
	}
	return nil
}

func createInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, nodeSpace *domain.NodeSpace) error {
	nbRows, err := createTreeInBase(ctx, bddAccess, nodeSpace.GetSpace(), nodeSpace.GetParentId(), nodeSpace.GetNextId())
	if err != nil {
		return err
	}
	if nbRows > 0 {
		log.Printf("%v lignes créées", nbRows)
	}
	return nil
}

func updateInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, nodeSpace *domain.NodeSpace) error {
	space := nodeSpace.GetSpace()
	previousUpdated, err := updatePreviousNextId(ctx, bddAccess, space, nodeSpace.GetPreviousId())
	if err != nil {
		return err
	}
	nbUpdated, nbNextIdUpdated, err := updateTreeInBase(ctx, bddAccess, space, nodeSpace.GetParentId(), nodeSpace.GetNextId())
	if err != nil {
		return err
	}
	if previousUpdated {
		nbNextIdUpdated++
	}
	if nbUpdated > 0 {
		log.Printf("%v lignes modifiées ou déplacées", nbUpdated)
	}
	if nbNextIdUpdated > 0 {
		log.Printf("%v identifiants ligne suivante mis à jour", nbNextIdUpdated)
	}
	return nil
}

func createTreeInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space, parentId, nextId string) (int, error) {
	nbCreated := 0
	if space.IsToCreate() {
		err := createSpace(ctx, bddAccess, space, parentId, nextId)
		if err != nil {
			return 0, err
		}
		nbCreated++
	}
	nbChildCreation, err := createSpacesInBase(ctx, bddAccess, space.GetChildrenSpaces(), space.GetCurrentId())
	if err != nil {
		return 0, err
	}
	nbCreated += nbChildCreation
	return nbCreated, nil
}

func createSpacesInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, spaces *domain.Spaces, parentId string) (int, error) {
	nbCreated := 0
	listOfSpaces := spaces.GetList()
	nextId := ""
	for index := len(listOfSpaces) - 1; index >= 0; index-- {
		space := listOfSpaces[index]
		nbSpaceCreation, err := createTreeInBase(ctx, bddAccess, space, parentId, nextId)
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

func updateTreeInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space, parentId, nextId string) (int, int, error) {
	nbUpdated := 0
	nbNextIdUpdated := 0
	if space.IsToUpdate() {
		updated, err := updateSpace(ctx, bddAccess, space, parentId, nextId)
		if err != nil {
			return 0, 0, err
		}
		if updated {
			nbUpdated++
		}
	} else if !space.IsToDelete() {
		updated, err := updateNextId(ctx, bddAccess, space, nextId)
		if err != nil {
			return 0, 0, err
		}
		if updated {
			nbNextIdUpdated++
		}
	}
	nbChildUpdated, nbChildNextIdUpdated, err := updateSpacesInBase(ctx, bddAccess, space.GetChildrenSpaces(), space.GetCurrentId())
	if err != nil {
		return 0, 0, err
	}
	nbUpdated += nbChildUpdated
	nbNextIdUpdated += nbChildNextIdUpdated
	return nbUpdated, nbNextIdUpdated, nil
}

func updateSpacesInBase(ctx context.Context, bddAccess bddAccess.WriteDataOperation, spaces *domain.Spaces, parentId string) (int, int, error) {
	nbUpdated := 0
	nbNextIdUpdated := 0
	listOfSpaces := spaces.GetList()
	nextId := ""
	for index := len(listOfSpaces) - 1; index >= 0; index-- {
		space := listOfSpaces[index]
		nbSpaceUpdated, nbSpaceNextIdUpdated, err := updateTreeInBase(ctx, bddAccess, space, parentId, nextId)
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

func deleteSpaces(ctx context.Context, bddAccess bddAccess.WriteDataOperation, itemsIdToDelete []string) (int, error) {
	if len(itemsIdToDelete) > 0 {
		return bddAccess.DeleteIn(ctx, DELETE_SQL, itemsIdToDelete)
	}
	return 0, nil
}

func createSpace(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space, parentId, nextId string) error {
	itemModel := entityBdd.ConvertSpaceToModel(*space, parentId, nextId)
	err := bddAccess.Insert(ctx, INSERT_SQL, itemModel)
	//err := requestSQL.ExecWithReturn(ctx, bddAccess.GetConnection(), itemModel, &itemModel, INSERT_SQL)
	if err != nil {
		return err
	}
	space.Save(itemModel.GetId())
	return nil
}

// updateSpace : modification d'un espace. Retourne une erreur si la requête échoue. Retourne true si la requête a modifié
// l'espace
func updateSpace(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space, parentId, nextId string) (bool, error) {
	itemModel := entityBdd.ConvertSpaceToModel(*space, parentId, nextId)
	nbUpdates, err := bddAccess.UpdateModel(ctx, UPDATE_SQL, itemModel)
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
func updatePreviousNextId(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space, previousId string) (bool, error) {
	if len(previousId) == 0 {
		return false, nil
	}
	id := entityBdd.ConvertIdToBdd(previousId)
	nextIdBdd := entityBdd.GetCurrentBddId(space)
	nbNextIdUpdates, err := bddAccess.Update(ctx, UPDATE_NEXT_SQL, nextIdBdd, id, nextIdBdd)
	if err != nil {
		return false, err
	}
	if nbNextIdUpdates == 0 {
		return false, nil
	}
	log.Printf("Item '%v' (%v): ligne suivante item précédent mis à jour", space.GetTitle(), id)
	return true, nil
}

func updateNextId(ctx context.Context, bddAccess bddAccess.WriteDataOperation, space *domain.Space, nextId string) (bool, error) {
	var nbNextIdUpdated int
	var err error
	idBdd := entityBdd.GetCurrentBddId(space)
	if len(nextId) == 0 {
		nbNextIdUpdated, err = bddAccess.Update(ctx, UPDATE_NEXT_NULL_SQL, idBdd)
	} else {
		nextBddId := entityBdd.ConvertIdToBdd(nextId)
		nbNextIdUpdated, err = bddAccess.Update(ctx, UPDATE_NEXT_SQL, nextBddId, idBdd, nextBddId)
	}
	if err != nil {
		return false, err
	}
	if nbNextIdUpdated == 0 {
		return false, nil
	}
	log.Printf("Item '%v'(%v) : identifiant ligne suivante mis à jour", space.GetTitle(), idBdd)
	return true, nil
}
