package api

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"goTool/internal/api/application"
	"goTool/internal/api/config"
	"goTool/internal/api/infrastructure/bddService"
	"goTool/internal/api/infrastructure/repository"
	"goTool/internal/api/interface/handler"
	"goTool/internal/api/interface/handler/route"
	"goTool/internal/api/interface/httpServer"
)

const BDD_INIT_TIMEOUT = 10 * time.Second

func setEnv(env string, dest *string) {
	value := os.Getenv(env)
	if value != "" {
		*dest = value
	}
}

func StartDesktop() {
	config.LoadDesktopConfig()
	start()
}

func StartAndServe() {
	config.LoadServerConfig()
	start()
	Serve()
	if config.GetProperties().MustAuthenticate {
		serveUserRoutes()
	}
	httpServerService := httpServer.HttpServerService()
	handler.InitServerService(&httpServerService)
	// Attente arrêt du serveur http
	httpServerService.ServerWait()
	log.Println("Le programme s'est arrêté")
}

func start() {
	// Bases de données
	bddAccessService := bddService.Service(bddService.Provider{})
	// Permet d'ouvrir et de fermer l'accès aux données
	handler.InitDataAccessService(bddAccessService)
	// Permet d'accéder aux données (lecture/écriture)
	repository.InitAccessService(bddAccessService)

	ctx, cancel := context.WithTimeout(context.Background(), BDD_INIT_TIMEOUT)
	defer cancel()

	initDataService := application.DataInitService(repository.DataInit())
	err := initDataService.Init(ctx)
	if err != nil {
		panic("Impossible d'initialiser la structure des données :" + err.Error())
	}
}

func Serve() *http.ServeMux {
	// Services : lien entre le métier (service) et les données (repository). Ici les données sont en base et la base de données est configurable
	spaceQueryService := application.SpaceQueryService(repository.SpaceQuery())
	spaceFileService := application.SpaceFileService(repository.SpaceFile())
	spaceCommandService := application.SpaceCommandService(repository.SpaceCommand())

	// Routes : les transformations des paramètres des requêtes et du retour sont faites dans la partie interface
	handler.HandleGetRoute(route.START, handler.AsNoDataAccessCall(handler.VerifyIfStarted))
	handler.HandleGetRoute(route.STOP, handler.AsNoDataAccessCall(handler.StopApp))

	handler.HandlePostRoute(route.ITEM_SAVE, handler.AsParamDataAccessCall(spaceCommandService.Save, bddService.WRITE))
	handler.HandleGetRoute(route.ITEM_FIND_ALL, handler.AsDataAccessCall(spaceQueryService.FindAll, bddService.READ))
	handler.HandlePostRoute(route.ITEM_IMPORT, handler.AsFileParamCall(spaceFileService.Import))
	handler.HandlePostRoute(route.ITEM_EXPORT, handler.AsConvertFileCall(spaceFileService.Export))

	return http.DefaultServeMux
}

func serveUserRoutes() {
	handler.InitAuthService(application.AuthentificationService())

	userCommandService := application.UserCommandService(repository.UserCommand())
	userQueryService := application.UserQueryService(repository.UserQuery())
	handler.HandlePostRoute(route.REFRESH, handler.AsRefreshCall(userCommandService.Refresh, bddService.WRITE))
	handler.HandlePostRoute(route.SIGNUP, handler.AsLoginCall(userCommandService.Signup, bddService.WRITE))
	handler.HandlePostRoute(route.LOGIN, handler.AsLoginCall(userCommandService.Login, bddService.WRITE))

	handler.HandleGetRoute(route.USER_FIND_ALL, handler.AsDataAccessCall(userQueryService.FindAll, bddService.READ))
}
