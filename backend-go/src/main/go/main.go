package main

import (
	"fmt"
	"log"
	"net/http"

	"goTool/controller"
	"goTool/database"
	"goTool/handler"
)


func main() {
	err := database.StartH2Server()
	if err != nil {
			log.Fatalf("Impossible de démarrer H2 : %s", err)
	}
	defer database.StopH2Server()
	
	http.HandleFunc("/", func(response http.ResponseWriter, request *http.Request) {
		fmt.Fprintf(response, "Le service est bien démarré")
	})
	handler.Handle("/api/item/findAllItems", controller.FindAllItems)
	handler.Stop("/stop")

	handler.Start()
	log.Println("Le programme s'est arrêté")
}