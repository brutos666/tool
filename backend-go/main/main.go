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
	/*
		// Si la base de données n'est pas démarrée, on la démarre
		err := server.StartServer(config.GetBaseConnection())
		if err != nil {
				log.Fatalf("Impossible de démarrer H2 : %s", err)
		}
		defer server.StopServer(config.GetBaseConnection())
	*/
	// Bases de données
	bddService := bddAccess.BddService(bddAccess.Provider{})
	bdd.InitServerService(bddService)

	ctx, cancel := context.WithTimeout(context.Background(), BDD_INIT_TIMEOUT)
	defer cancel()

	initDataService := application.DataInitService(bdd.DataInitRepository())
	err := initDataService.Init(ctx)
	if err != nil {
		panic("Impossible d'initialiser la structure des données :" + err.Error())
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
	handler.HandleGetRoute(route.START, handler.AsNoDataAccessCall(handler.VerifyIfStarted))
	handler.HandleGetRoute(route.STOP, handler.AsNoDataAccessCall(handler.StopApp))

	handler.HandlePostRoute(route.ITEM_SAVE, handler.AsParamDataAccessCall(spaceCommandService.Save, bddService, bddAccess.WRITE))
	handler.HandleGetRoute(route.ITEM_FIND_ALL, handler.AsDataAccessCall(spaceQueryService.FindAll, bddService, bddAccess.READ))

	handler.HandlePostRoute(route.REFRESH, handler.AsRefreshCall(userCommandService.Refresh, bddService, bddAccess.WRITE))
	handler.HandlePostRoute(route.SIGNUP, handler.AsLoginCall(userCommandService.Signup, bddService, bddAccess.WRITE))
	handler.HandlePostRoute(route.LOGIN, handler.AsLoginCall(userCommandService.Login, bddService, bddAccess.WRITE))

	handler.HandleGetRoute(route.USER_FIND_ALL, handler.AsDataAccessCall(userQueryService.FindAll, bddService, bddAccess.READ))

	// Attente arrêt du serveur http
	httpServerService.ServerWait()
	log.Println("Le programme s'est arrêté")
}
