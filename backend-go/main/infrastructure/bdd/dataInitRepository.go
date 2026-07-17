package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"log"

	"goTool/config"
	"goTool/domain"
	"goTool/infrastructure/bddAccess"
	"goTool/utilities"
)

type dataInitRepository struct{}

func DataInitRepository() domain.DataInitRepository {
	return &dataInitRepository{}
}

func (repo *dataInitRepository) Init(ctx context.Context, dataAccess domain.DataAccess) (err error) {
	/*
		// Si la base de données n'est pas démarrée, on la démarre
		err := server.StartServer(config.GetBaseConnection())
		if err != nil {
				log.Fatalf("Impossible de démarrer H2 : %s", err)
		}
		defer server.StopServer(config.GetBaseConnection())
	*/
	err = dataAccess.Open()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			err = utilities.JoinErrors(err, dataAccess.Cancel())
		}
	}()
	defer func() {
		err = utilities.JoinErrors(err, dataAccess.Close())
	}()

	err = doLaunchScript(ctx, dataAccess.(bddAccess.Access).GetConnection(), config.GetSchemaPath())
	if err != nil {
		log.Fatalf("Impossible de créer les tables : %s", err)
	}
	log.Printf("Lancement du script de création des tables et index")
	return nil
}

func doLaunchScript(ctx context.Context, connection connection.Connection, filepath string) error {
	nbRows, err := requestSQL.LaunchSQLScript(ctx, connection, filepath)
	if err != nil {
		return err
	}
	log.Println("Nombre d'insertion, modification ou suppression :", nbRows)
	return nil
}
