// Package repository s'occupe de la recherche et la mise à jour des données en base.
// Ce package connaît le package "domain"
package repository

import "goTool/infrastructure/bddService"

var bddAccessService bddService.BddAccessReadWrite

func InitAccessService(bddService bddService.BddAccessReadWrite) {
	bddAccessService = bddService
}
