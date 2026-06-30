package controller

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"goTool/handler"
	"goTool/repository"
)

func Start() {
	go stopServerOnSignal()
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

func stopServerOnSignal() {
	// Create a channel to receive signals
	sigChan := make(chan os.Signal, 1)

	// Notify the channel for specific signals
	signal.Notify(sigChan,
		syscall.SIGINT,  // Ctrl+C
		syscall.SIGTERM, // Termination signal
	)

	// Wait for signal
	sig := <-sigChan
	log.Printf("Réception du signal d'interruption '%v'", sig)
	handler.ServerStop()
}
