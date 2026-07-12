package main

import (
	"context"
	"log"
	"net/http"

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

	// Routes : les transformations des paramètres des requêtes et du retour sont faites dans le package
	handler.Verify(route.START)
	handler.Stop(route.STOP)
	handler.HandleRoute(route.ITEM_FIND_ALL, http.MethodGet, call.Get(spaceQueryService.FindAll), new(bddAccess.Reader))
	handler.HandleRoute(route.ITEM_SAVE, http.MethodPost, call.WithParam(spaceCommandService.Save), new(bddAccess.Writer))
	handler.HandleLoginRoute(route.REFRESH, call.WithUserToLog(userCommandService.Refresh), new(bddAccess.Writer))
	handler.HandleLoginRoute(route.SIGNUP, call.WithUserToLog(userCommandService.Signup), new(bddAccess.Writer))
	handler.HandleLoginRoute(route.LOGIN, call.WithUserToLog(userCommandService.Login), new(bddAccess.Writer))
	handler.HandleRoute(route.USER_FIND_ALL, http.MethodGet, call.Get(userQueryService.FindAll), new(bddAccess.Reader))

	httpServer.ServerWait()
	log.Println("Le programme s'est arrêté")
}
