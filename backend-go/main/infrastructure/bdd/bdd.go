package bdd

import "goTool/infrastructure/bddAccess"

var bddAccessService *bddAccess.Service

func InitServerService(bddService *bddAccess.Service) {
	bddAccessService = bddService
}
