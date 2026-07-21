package main

import (
	"context"
	"log"
	"time"

	"goTool/application"
	"goTool/config"
	"goTool/infrastructure/bdd"
	"goTool/infrastructure/bddAccess"
	"goTool/interface/handler"
	"goTool/interface/handler/route"
	"goTool/interface/httpServer"
)

const BDD_INIT_TIMEOUT = 10 * time.Second

func main() {
	config.InitConfig()
	// Bases de données
	bddWriteService := bddAccess.AsWrite()
	bddReadService := bddAccess.AsRead()

	ctx, cancel := context.WithTimeout(context.Background(), BDD_INIT_TIMEOUT)
	defer cancel()

	initDataService := application.DataInitService(bdd.DataInitRepository())
	err := initDataService.Init(ctx, bddWriteService.GetInstance())
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

	handler.HandlePostRoute(route.ITEM_SAVE, handler.AsCallWithParam(spaceCommandService.Save, bddWriteService))
	handler.HandleGetRoute(route.ITEM_FIND_ALL, handler.AsBasicCall(spaceQueryService.FindAll, bddReadService))

	handler.HandlePostRoute(route.REFRESH, handler.AsRefreshCall(userCommandService.Refresh, bddWriteService))
	handler.HandlePostRoute(route.SIGNUP, handler.AsLoginCall(userCommandService.Signup, bddWriteService))
	handler.HandlePostRoute(route.LOGIN, handler.AsLoginCall(userCommandService.Login, bddWriteService))

	handler.HandleGetRoute(route.USER_FIND_ALL, handler.AsBasicCall(userQueryService.FindAll, bddReadService))

	// Attente arrêt du serveur http
	httpServerService.ServerWait()
	log.Println("Le programme s'est arrêté")
}
