package repository

import (
	"context"
	"log"

	"goTool/internal/api/config"
	"goTool/internal/api/domain"
	"goTool/internal/api/infrastructure/bddService"
	"goTool/internal/api/utilities"
)

type dataInitRepository struct{}

func DataInit() domain.DataInitRepository {
	return &dataInitRepository{}
}

func (repo *dataInitRepository) Init(ctx context.Context) (err error) {
	access := new(bddService.Writer)
	err = access.Open()
	if err != nil {
		return err
	}
	defer func() {
		err = utilities.JoinErrors(err, access.Close())
	}()
	defer func() {
		if err != nil {
			err = utilities.JoinErrors(err, access.Cancel())
		}
	}()

	return doLaunchScript(ctx, access, config.GetProperties().DatabaseSql)
}

func doLaunchScript(ctx context.Context, dataBase bddService.WriteCommands, filepath string) error {
	nbRows, err := dataBase.LaunchSQLScript(ctx, filepath)
	if err != nil {
		return err
	}
	log.Printf("Lancement sql %s => %v insertion(s), modification(s) ou suppression(s)", filepath, nbRows)
	return nil
}
