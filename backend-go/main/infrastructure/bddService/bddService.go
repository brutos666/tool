// Package bddService s'occupe des connections à la base de données et des commandes effectuées dessus
// A chaque requête http ayant besoin de la base de données, une nouvelle connection est créée, ouverte et stockée dans une map pour un identifiant. Cette connection est commit/rollback si besoin avant d'être fermée puis supprimée avant le retour de la réponse.
// Le passage en mode transactionnel se fait en dehors du service et du repo pour pouvoir complètement séparer logique métier et modification des données (sachant que dans un même service, on peut appeler plusieurs fois un repo avec de la logique métier entre les appels). L'identifiant de la connection est passé au service puis au repos pour travailler avec la bonne connection
// Si un besoin de faire du transactionnel partiel, il faudra ajouter une nouvelle logique
package bddService

import (
	"log"
	"slices"
	"sync"

	"goTool/generic"
	"goTool/utilities"
)

// Service gère un nombre maximum de connection à la base de données en utilisant des verrous si toutes les bases sont occupées. Ce n'est pas encore un pool de connection car ces dernières sont fermées et libérées après utilisation
// Fourni donc un accès en lecture ou écriture à la base de données
func Service(provider generic.DataAccessProvider) *service {
	freeIdentity := make([]int, MAX_CONNECTION)
	for i := range freeIdentity {
		freeIdentity[i] = i
	}
	lockManager := new(sync.Mutex)
	cond := sync.NewCond(lockManager)
	bddAccess := make(map[int]generic.DataAccess, MAX_CONNECTION)
	return &service{bddAccess: bddAccess, freeIdentity: freeIdentity, lockManager: lockManager, cond: cond, provider: provider}
}

type service struct {
	bddAccess    map[int]generic.DataAccess
	freeIdentity []int
	lockManager  *sync.Mutex
	cond         *sync.Cond
	provider     generic.DataAccessProvider
}

func (service *service) OpenAccess(accessType string) (int, error) {
	// Positionne un verrou.
	// Ce que j'ai compris : si le verrou est déjà pris, la suite ne s'effectue pas
	service.lockManager.Lock()
	defer service.lockManager.Unlock()

	sizeFree := len(service.freeIdentity)
	if sizeFree == 0 {
		log.Printf("Réservation impossible - %v identifiant disponible", sizeFree)
		// Indique à la goroutine qu'elle doit attendre un signal pour repartir (quand une instance sera libérée)
		// La suite ne fait donc pas tant que le signal n'aura pas été envoyé
		service.cond.Wait()
		sizeFree = len(service.freeIdentity)
		log.Printf("Débloqué")
	}
	identity := service.freeIdentity[sizeFree-1]
	service.freeIdentity = slices.Delete(service.freeIdentity, sizeFree-1, sizeFree)
	log.Printf("Réservation identifiant %v - %v identifiant(s) restant(s)", identity, sizeFree-1)

	dataAccess := service.provider.ProvideAccess(accessType)
	err := dataAccess.Open()
	if err != nil {
		return -1, err
	}
	service.bddAccess[identity] = dataAccess
	return identity, err
}

func (service *service) CloseAccess(identity int, err error) (errOut error) {
	dataAccess := service.bddAccess[identity]
	errOut = err
	defer func() { errOut = utilities.JoinErrors(errOut, dataAccess.Close()) }()
	defer func() {
		// Rollback si une erreur est survenu
		if errOut != nil {
			errOut = utilities.JoinErrors(errOut, dataAccess.Cancel())
		}
	}()

	// Positionne un verrou.
	service.lockManager.Lock()
	defer service.lockManager.Unlock()

	delete(service.bddAccess, identity)
	service.freeIdentity = append(service.freeIdentity, identity)
	log.Printf("Libération identifiant %v - %v identifiant(s) disponible(s)", identity, len(service.freeIdentity))
	// Indique à une goroutine bloquée qu'elle peut y aller
	service.cond.Signal()

	return errOut
}

func (service *service) RetrieveReadAccess(identity int) ReadCommands {
	return service.bddAccess[identity].(ReadCommands)
}

func (service *service) RetrieveWriteAccess(identity int) WriteCommands {
	return service.bddAccess[identity].(WriteCommands)
}

func (service *service) GetAccess(identity int) generic.DataAccess {
	return service.bddAccess[identity]
}
