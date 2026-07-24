package bdd

import "goTool/infrastructure/bddService"

var bddAccessService bddService.BddAccessReadWrite

func InitAccessService(bddService bddService.BddAccessReadWrite) {
	bddAccessService = bddService
}
