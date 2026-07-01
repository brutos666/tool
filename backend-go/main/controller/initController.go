package controller

import (
	"context"
	"log"

	"goTool/repository"
)

func Start() {
	/*
		// Si la base de données n'est pas démarrée, on la démarre
		err := server.StartServer(repository.BaseConnection)
		if err != nil {
				log.Fatalf("Impossible de démarrer H2 : %s", err)
		}
		defer server.StopServer(repository.BaseConnection)
	*/

	log.Printf("Lancement du script de création des tables et index")
	err := repository.LaunchSQLScript(context.Background(), repository.SCHEMA_PATH)
	if err != nil {
		log.Fatalf("Impossible de créer les tables : %s", err)
	}
}
