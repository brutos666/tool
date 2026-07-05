// Package treeConverter permet la conversion d'entité en arbre selon un contrat bien défini :
// Chaque entité doit avoir :
//	- un identifiant
//	- l'identifiant de l'entité parente
//	- l'identifiant de l'entité suivante (ou rien si pas de suivante)
// Ces identifiants doivent être retourné en chaines de caractères par les méthodes GetId(), GetParentId() et GetNExtId() (contrat pour cette conversion de liste plate en arbre)

package treeConverter

import (
	"slices"

	"treeConverter/utilities"
)

const (
	OK             = "OK"
	NEXT_NOT_FOUND = "NEXT_NOT_FOUND"
	LOOP           = "LOOP"
	ORPHAN         = "ORPHAN"
	TOTAL_ORPHAN   = "TOTAL_ORPHAN"
)

func ConvertFlatToTree[F FlatEntity, T TreeEntity](rootIdKey string, flats []F) []T {
	// Convertis explicitement en []FlatEntity
	flatItems := make([]FlatEntity, len(flats))
	for i, item := range flats {
		flatItems[i] = item
	}
	treeItems := ConvertFlatEntitiesToTreeEntities(rootIdKey, flatItems)
	trees := make([]T, len(treeItems))
	for i, item := range treeItems {
		trees[i] = item.(T)
	}
	return trees
}

func ConvertFlatEntitiesToTreeEntities(rootIdKey string, flatItems []FlatEntity) []TreeEntity {
	groupedByParent := utilities.GroupBy(
		flatItems,
		func(flatItem FlatEntity) string { return flatItem.GetParentId() })
	// Trier les enfants directs entre eux
	sortedItems := make(map[string][]TreeEntity)
	for key, flatItems := range groupedByParent {
		sortedItems[key] = sortSameParentItems(flatItems)
	}
	return getChildren(rootIdKey, sortedItems)
}

func getChildren(IdKey string, sortedItems map[string][]TreeEntity) []TreeEntity {
	children := sortedItems[IdKey]
	if children == nil {
		return []TreeEntity{}
	}
	for index, item := range children {
		children[index].SetChildren(getChildren(item.GetId(), sortedItems))
	}
	return children
}

func sortSameParentItems(flatItems []FlatEntity) []TreeEntity {
	nbItems := len(flatItems)
	if nbItems == 1 {
		return []TreeEntity{flatItems[0].ConvertToTree()}
	}
	var sortedItems []TreeEntity
	allSortedItems := make([]TreeEntity, 0)
	idsLeftToProcess, firstItemsIds, flatItemById := collectInformations(flatItems)
	for _, firstId := range firstItemsIds {
		sortedItems, idsLeftToProcess = process(flatItemById, firstId, idsLeftToProcess)
		allSortedItems = append(allSortedItems, sortedItems...)
	}
	if len(firstItemsIds) > 1 {
		// Il ne peut y avoir qu'un seul premier. Dans le cas contraire, il faut marquer les éléments comme orphelin
		for index, item := range allSortedItems {
			if slices.Contains(firstItemsIds, item.GetId()) {
				changeStatus(allSortedItems[index], ORPHAN)
			}
		}
	}
	for len(idsLeftToProcess) > 0 {
		// S'il reste des identifiants non traités, c'est probablement des boucles
		id := idsLeftToProcess[0]
		sortedItems, idsLeftToProcess = process(flatItemById, id, idsLeftToProcess)
		allSortedItems = append(allSortedItems, sortedItems...)
	}
	return allSortedItems
}

func collectInformations(flatItems []FlatEntity) (allIds []string, firstIds []string, flatItemById map[string]FlatEntity) {
	nbItems := len(flatItems)
	allNextIds := make([]string, nbItems)
	allIds = make([]string, nbItems)
	flatItemById = make(map[string]FlatEntity, nbItems)
	for index, flatItem := range flatItems {
		allNextIds[index] = flatItem.GetNextId()
		flatItemById[flatItem.GetId()] = flatItem
		allIds[index] = flatItem.GetId()
	}
	slices.Sort(allIds)
	firstIds = make([]string, 0)
	for _, flatItem := range flatItems {
		id := flatItem.GetId()
		if isFirst(allNextIds, id) {
			firstIds = append(firstIds, id)
		}
	}
	return
}

// Un item est le premier s'il n'existe pas en tant que suivant
func isFirst(allNextIds []string, id string) bool {
	return !slices.Contains(allNextIds, id)
}

/**
* Construit la liste des items à partir du 1er de la liste en recherchant les suivants
* flatItemById : Map dont la clé est l'identifiant et la valeur l'item issu de la base de données
* id : identifiant de l'item traité
* ids : liste des identifiants restant à traiter
* @return items triés. Si l'identifiant du suivant est incorrect, le status de l'item vaudra :
* 	- LOOP si l'item suivant est déjà dans les items triés
*		- NEXT_NOT_FOUND, si l'identifiant n'est pas trouvé
 */
func process(flatItemById map[string]FlatEntity, id string, ids []string) ([]TreeEntity, []string) {
	sortedItems := make([]TreeEntity, 0)
	sortedIds := make([]string, 0)
	currentItem := flatItemById[id]
	// Si l'identifiant n'existe pas en tant que suivant, alors il s'agit du 1er. On va construire
	// la liste ordonnée à partir du 1er en recherchant les suivants
	for {
		sortedItems = append(sortedItems, currentItem.ConvertToTree())
		sortedIds = append(sortedIds, currentItem.GetId())
		ids = slices.DeleteFunc(ids, func(value string) bool {
			return value == currentItem.GetId()
		})
		if len(currentItem.GetNextId()) == 0 {
			break
		}
		nextId := currentItem.GetNextId()
		if nextIdNotFound(ids, nextId) {
			item := sortedItems[len(sortedItems)-1]
			if isLoop(sortedIds, nextId) {
				changeStatus(item, LOOP)
			} else {
				changeStatus(item, NEXT_NOT_FOUND)
			}
			break
		}
		currentItem = flatItemById[nextId]
	}
	return sortedItems, ids
}

func nextIdNotFound(ids []string, nextId string) bool {
	return !slices.Contains(ids, nextId)
}

func isLoop(sortedIds []string, nextId string) bool {
	return slices.Contains(sortedIds, nextId)
}

func changeStatus(pEntity TreeEntity, statusToApply string) {
	pEntity.SetStatus(getNewStatus(pEntity.GetStatus(), statusToApply))
}

func getNewStatus(status string, statusToApply string) string {
	if status == ORPHAN && statusToApply == NEXT_NOT_FOUND || status == NEXT_NOT_FOUND && statusToApply == ORPHAN {
		return TOTAL_ORPHAN
	}
	return statusToApply
}
