package main

import (
	"log"
	"net/http"

	"goTool/controller"
	"goTool/handler"
)

func init() {
	controller.Start()
}

func main() {
	handler.ServerStart()

	http.HandleFunc("/", func(response http.ResponseWriter, request *http.Request) {
		log.Println(response, "Le service est bien démarré")
	})
	handler.HandleGet("/api/item/findAllItems", controller.FindAllItems)
	handler.HandlePost("/api/item/save", controller.SaveTreeItem)

	handler.HandlePost("/api/user/signup", controller.Signup)
	handler.HandleGet("/api/user/findAllUsers", controller.FindAllUsers)

	handler.Stop("/stop")

	handler.ServerWait()
	log.Println("Le programme s'est arrêté")
}
