package main

import (
	"context"
	"log"

	"goTool/application"
	"goTool/config"
	"goTool/infrastructure/bdd"
	"goTool/infrastructure/bddAccess"
	"goTool/interface/http/handler"
	"goTool/interface/http/handler/call"
	"goTool/interface/http/handler/route"
	"goTool/interface/http/httpServer"
)

func main() {
	config.InitConfig()
	initDataService := application.DataInitService(bdd.DataInitRepository())
	err := initDataService.Init(context.Background(), new(bddAccess.Writer))
	if err != nil {
		panic(err)
	}
	if config.IsDev() {
		httpServer.ServeLocalFrontEnd()
	}
	httpServer.ServerStart()
	go httpServer.StopServerOnSignal()

	// Services : lien entre le métier et les données. Ici les données sont en base et la base de données est configurable
	spaceQueryService := application.SpaceQueryService(bdd.SpaceQueryRepository())
	spaceCommandService := application.SpaceCommandService(bdd.SpaceCommandRepository())
	userCommandService := application.UserCommandService(bdd.UserCommandRepository())
	userQueryService := application.UserQueryService(bdd.UserQueryRepository())

	// Routes : les transformations des paramètres des requêtes et du retour sont faites dans la partie interface
	handler.Verify(route.START)
	handler.Stop(route.STOP)
	handler.HandlePostRoute(route.ITEM_SAVE, call.AsCallWithParam(spaceCommandService.Save), &bddAccess.Writer{})
	handler.HandleGetRoute(route.ITEM_FIND_ALL, call.AsBasicCall(spaceQueryService.FindAll), &bddAccess.Reader{})

	handler.HandlePostRoute(route.REFRESH, call.AsRefreshCall(userCommandService.Refresh), &bddAccess.Writer{})
	handler.HandlePostRoute(route.SIGNUP, call.AsLoginCall(userCommandService.Signup), &bddAccess.Writer{})
	handler.HandlePostRoute(route.LOGIN, call.AsLoginCall(userCommandService.Login), &bddAccess.Writer{})

	handler.HandleGetRoute(route.USER_FIND_ALL, call.AsBasicCall(userQueryService.FindAll), &bddAccess.Reader{})

	httpServer.ServerWait()
	log.Println("Le programme s'est arrêté")
}
