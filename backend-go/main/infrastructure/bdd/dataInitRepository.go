package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"errors"
	"log"

	"goTool/config"
	"goTool/domain"
	"goTool/infrastructure/bddAccess"
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
	err = dataAccess.Start(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			err = errors.Join(err, dataAccess.Cancel(ctx))
		}
	}()
	defer func() {
		err = errors.Join(err, dataAccess.Stop(ctx))
	}()

	err = doLaunchScript(dataAccess.(bddAccess.Access).GetConnection(), config.GetSchemaPath())
	if err != nil {
		log.Fatalf("Impossible de créer les tables : %s", err)
	}
	log.Printf("Lancement du script de création des tables et index")
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
