package main

import (
	"log"
	"net/http"

	"goTool/application"
	"goTool/controller"
	"goTool/infrastructure/bdd"
	"goTool/interface/http/handler"
	"goTool/interface/http/httpServer"
	"goTool/interface/itemWebResult"
)

func init() {
	controller.Start()
}

func main() {
	httpServer.ServerStart()
	go httpServer.StopServerOnSignal()

	// Faire le lien entre l'infrastructure à utiliser pour répondre à une action métier
	itemQueryService := application.ItemQueryService(bdd.ItemQueryRepository())
	itemCommandService := application.ItemCommandService(bdd.ItemCommandRepository())

	http.HandleFunc("/", func(response http.ResponseWriter, request *http.Request) {
		log.Println(response, "Le service est bien démarré")
	})
	handler.HandleQueryRoute("/api/item/findAllItems", itemQueryService.FindAll, itemWebResult.ConvertItemsFoundToWebResult)
	handler.HandleCommandRoute("/api/item/save", itemCommandService.Save)

	handler.HandlePost("/api/user/signup", controller.Signup)
	handler.HandleGet("/api/user/findAllUsers", controller.FindAllUsers)

	handler.Stop("/stop")

	httpServer.ServerWait()
	log.Println("Le programme s'est arrêté")
}
