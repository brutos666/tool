package bdd

import "goTool/infrastructure/bddAccess"

var bddAccessService bddAccess.BddDataOperation

func InitServerService(bddService bddAccess.BddDataOperation) {
	bddAccessService = bddService
}
