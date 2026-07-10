package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"log"

	"goTool/config"
	"goTool/domain"
)

type dataInitRepository struct{}

func DataInitRepository() domain.DataInitRepository {
	return &dataInitRepository{}
}

func (repo *dataInitRepository) Init(ctx context.Context) error {
	/*
		// Si la base de données n'est pas démarrée, on la démarre
		err := server.StartServer(config.GetBaseConnection())
		if err != nil {
				log.Fatalf("Impossible de démarrer H2 : %s", err)
		}
		defer server.StopServer(config.GetBaseConnection())
	*/
	log.Printf("Lancement du script de création des tables et index")
	err := connection.LaunchTransactionnelWay(ctx, config.GetBaseConnection(), doLaunchScript, config.GetSchemaPath())
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
