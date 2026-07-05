package main

import (
	"context"
	"log"

	"goTool/application"
	"goTool/infrastructure/bdd"
	"goTool/interface/http/handler"
	"goTool/interface/http/httpServer"
)

func main() {
	initDataService := application.DataInitService(bdd.DataInitRepository())
	err := initDataService.Init(context.Background())
	if err != nil {
		panic(err)
	}

	httpServer.ServerStart()
	go httpServer.StopServerOnSignal()

	// Services : lien entre le métier et les données. Ici les données sont en base et la base de données est configurable
	spaceQueryService := application.SpaceQueryService(bdd.SpaceQueryRepository())
	spaceCommandService := application.SpaceCommandService(bdd.SpaceCommandRepository())
	userCommandService := application.UserCommandService(bdd.UserCommandRepository())
	userQueryService := application.UserQueryService(bdd.UserQueryRepository())

	// Routes : les transformations des paramètres des requêtes et du retour sont faites dans le package
	handler.HandleQueryRoute("/api/item/findAllItems", spaceQueryService.FindAll)
	handler.HandleCommandRoute("/api/item/save", spaceCommandService.Save)
	handler.HandleCommandRoute("/api/user/signup", userCommandService.Signup)
	handler.HandleQueryRoute("/api/user/findAllUsers", userQueryService.FindAll)
	handler.Test("/")
	handler.Stop("/stop")

	httpServer.ServerWait()
	log.Println("Le programme s'est arrêté")
}
