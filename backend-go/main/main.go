package main

import (
	"context"
	"log"
	"net/http"

	"goTool/application"
	"goTool/infrastructure/bdd"
	"goTool/interface/http/handler"
	"goTool/interface/http/handler/call"
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
	handler.Verify("/")
	handler.Stop("/stop")
	handler.HandleRoute("/api/item/findAllItems", http.MethodGet, call.Get(spaceQueryService.FindAll))
	handler.HandleRoute("/api/item/save", http.MethodPost, call.WithParam(spaceCommandService.Save))
	handler.HandleRoute("/api/authenticate/refresh", http.MethodPost, call.Get(userCommandService.Refresh))
	handler.HandleRoute("/api/authenticate/signup", http.MethodPost, call.WithParam(userCommandService.Signup))
	handler.HandleRoute("/api/authenticate/login", http.MethodPost, call.WithParam(userCommandService.Login))
	handler.HandleRoute("/api/user/findAllUsers", http.MethodGet, call.Get(userQueryService.FindAll))

	httpServer.ServerWait()
	log.Println("Le programme s'est arrêté")
}
