package main

import (
	"context"
	"log"
	"time"

	// Base de données supportées
	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"

	"goTool/application"
	"goTool/config"
	"goTool/infrastructure/bddService"
	"goTool/infrastructure/repository"
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
	bddAccessService := bddService.Service(bddService.Provider{})
	repository.InitAccessService(bddAccessService)

	ctx, cancel := context.WithTimeout(context.Background(), BDD_INIT_TIMEOUT)
	defer cancel()

	initDataService := application.DataInitService(repository.DataInit())
	err := initDataService.Init(ctx)
	if err != nil {
		panic("Impossible d'initialiser la structure des données :" + err.Error())
	}

	if config.IsDev() {
		httpServer.ServeLocalFrontEnd()
	}
	// Services : lien entre le métier (service) et les données (repository). Ici les données sont en base et la base de données est configurable
	spaceQueryService := application.SpaceQueryService(repository.SpaceQuery())
	spaceCommandService := application.SpaceCommandService(repository.SpaceCommand())
	userCommandService := application.UserCommandService(repository.UserCommand())
	userQueryService := application.UserQueryService(repository.UserQuery())

	httpServerService := httpServer.HttpServerService()
	handler.InitServerService(&httpServerService)
	handler.InitAuthService(application.AuthentificationService())
	// Routes : les transformations des paramètres des requêtes et du retour sont faites dans la partie interface
	handler.HandleGetRoute(route.START, handler.AsNoDataAccessCall(handler.VerifyIfStarted))
	handler.HandleGetRoute(route.STOP, handler.AsNoDataAccessCall(handler.StopApp))

	handler.HandlePostRoute(route.ITEM_SAVE, handler.AsParamDataAccessCall(spaceCommandService.Save, bddAccessService, bddService.WRITE))
	handler.HandleGetRoute(route.ITEM_FIND_ALL, handler.AsDataAccessCall(spaceQueryService.FindAll, bddAccessService, bddService.READ))

	handler.HandlePostRoute(route.REFRESH, handler.AsRefreshCall(userCommandService.Refresh, bddAccessService, bddService.WRITE))
	handler.HandlePostRoute(route.SIGNUP, handler.AsLoginCall(userCommandService.Signup, bddAccessService, bddService.WRITE))
	handler.HandlePostRoute(route.LOGIN, handler.AsLoginCall(userCommandService.Login, bddAccessService, bddService.WRITE))

	handler.HandleGetRoute(route.USER_FIND_ALL, handler.AsDataAccessCall(userQueryService.FindAll, bddAccessService, bddService.READ))

	// Attente arrêt du serveur http
	httpServerService.ServerWait()
	log.Println("Le programme s'est arrêté")
}
