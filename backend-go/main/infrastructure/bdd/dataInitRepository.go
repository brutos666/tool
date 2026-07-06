package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"log"

	"goTool/domain"
	"goTool/infrastructure/bdd/configuration"
)

type dataInitRepository struct{}

func DataInitRepository() domain.DataInitRepository {
	return &dataInitRepository{}
}

func (repo *dataInitRepository) Init(ctx context.Context) error {
	/*
		// Si la base de données n'est pas démarrée, on la démarre
		err := server.StartServer(repository.BaseConnection)
		if err != nil {
				log.Fatalf("Impossible de démarrer H2 : %s", err)
		}
		defer server.StopServer(repository.BaseConnection)
	*/
	log.Printf("Lancement du script de création des tables et index")
	err := connection.LaunchTransactionnelWay(ctx, configuration.BaseConnection, doLaunchScript, configuration.SCHEMA_PATH)
	if err != nil {
		log.Fatalf("Impossible de créer les tables : %s", err)
	}
	return nil
}

func doLaunchScript(connection connection.Connection, filepath string) error {
	nbRows, err := requestSQL.LaunchSQLScript(connection, filepath)
	if err != nil {
		return err
	}
	log.Println("Nombre d'insertion, modification ou suppression :", nbRows)
	return nil
}
