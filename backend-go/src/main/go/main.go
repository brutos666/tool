package main

import (
	"database/server/requestSQL"
	"log"
	"net/http"

	"goTool/controller"
	"goTool/handler"
	"goTool/repository"
)

func main() {
	/*
		// Si la base de données n'est pas démarrée, on la démarre
		err := server.StartServer(repository.BaseConnection)
		if err != nil {
				log.Fatalf("Impossible de démarrer H2 : %s", err)
		}
		defer server.StopServer(repository.BaseConnection)
	*/
	// Lancer le sql de création des tables si besoin
	err := requestSQL.CreateTables(repository.BaseConnection, repository.SCHEMA_PATH)
	if err != nil {
		log.Fatalf("Impossible de créer les tables : %s", err)
	}

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
