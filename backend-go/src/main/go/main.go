package main

import (
	"fmt"
	"log"
	"net/http"

	"goTool/controller"
	"goTool/handler"
)


func main() {
	/*
	err := server.StartServer(repository.BaseConnection)
	if err != nil {
			log.Fatalf("Impossible de démarrer H2 : %s", err)
	}
	defer server.StopServer(repository.BaseConnection)
	*/
		
	handler.ServerStart()
	
	http.HandleFunc("/", func(response http.ResponseWriter, request *http.Request) {
		fmt.Fprintf(response, "Le service est bien démarré")
	})

	handler.HandleGet("/api/item/findAllItems", controller.FindAllItems)
	handler.HandlePost("/api/item/save", controller.SaveTreeItem)
	handler.Stop("/stop")

	handler.ServerWait()
	log.Println("Le programme s'est arrêté")
}