package main

import (
	"context"
	"log"

	"goTool/application"
	"goTool/config"
	"goTool/infrastructure/bdd"
	"goTool/infrastructure/bddAccess"
	"goTool/interface/handler"
	"goTool/interface/handler/route"
	"goTool/interface/httpServer"
)

func main() {
	config.InitConfig()

	initDataService := application.DataInitService(bdd.DataInitRepository())
	err := initDataService.Init(context.Background(), bddAccess.AsWrite().GetInstance())
	if err != nil {
		panic(err)
	}

	if config.IsDev() {
		httpServer.ServeLocalFrontEnd()
	}
	// Services : lien entre le métier et les données. Ici les données sont en base et la base de données est configurable
	spaceQueryService := application.SpaceQueryService(bdd.SpaceQueryRepository())
	spaceCommandService := application.SpaceCommandService(bdd.SpaceCommandRepository())
	userCommandService := application.UserCommandService(bdd.UserCommandRepository())
	userQueryService := application.UserQueryService(bdd.UserQueryRepository())

	httpServerService := httpServer.HttpServerService()
	handler.InitServerService(&httpServerService)
	handler.InitAuthService(application.AuthentificationService())
	// Routes : les transformations des paramètres des requêtes et du retour sont faites dans la partie interface
	handler.Verify(route.START)
	handler.Stop(route.STOP)
	handler.HandlePostRoute(route.ITEM_SAVE, handler.AsCallWithParam(spaceCommandService.Save), bddAccess.AsWrite())
	handler.HandleGetRoute(route.ITEM_FIND_ALL, handler.AsBasicCall(spaceQueryService.FindAll), bddAccess.AsRead())

	handler.HandlePostRoute(route.REFRESH, handler.AsRefreshCall(userCommandService.Refresh), bddAccess.AsWrite())
	handler.HandlePostRoute(route.SIGNUP, handler.AsLoginCall(userCommandService.Signup), bddAccess.AsWrite())
	handler.HandlePostRoute(route.LOGIN, handler.AsLoginCall(userCommandService.Login), bddAccess.AsWrite())

	handler.HandleGetRoute(route.USER_FIND_ALL, handler.AsBasicCall(userQueryService.FindAll), bddAccess.AsRead())

	httpServerService.ServerWait()

	log.Println("Le programme s'est arrêté")
}
