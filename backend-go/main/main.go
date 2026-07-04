package main

import (
	"log"
	"net/http"

	"goTool/application"
	"goTool/controller"
	"goTool/infrastructure/bdd"
	"goTool/interface/http/handler"
	"goTool/interface/http/httpServer"
)

func init() {
	controller.Start()
}

func main() {
	httpServer.ServerStart()
	go httpServer.StopServerOnSignal()

	// Faire le lien entre l'infrastructure à utiliser pour répondre à une action métier
	spaceQueryService := application.SpaceQueryService(bdd.SpaceQueryRepository())
	spaceCommandService := application.SpaceCommandService(bdd.SpaceCommandRepository())

	http.HandleFunc("/", func(response http.ResponseWriter, request *http.Request) {
		log.Println(response, "Le service est bien démarré")
	})
	handler.HandleQueryRoute("/api/item/findAllItems", spaceQueryService.FindAll)
	handler.HandleCommandRoute("/api/item/save", spaceCommandService.Save)

	handler.HandlePost("/api/user/signup", controller.Signup)
	handler.HandleGet("/api/user/findAllUsers", controller.FindAllUsers)

	handler.Stop("/stop")

	httpServer.ServerWait()
	log.Println("Le programme s'est arrêté")
}
