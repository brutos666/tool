package bdd

import (
	"context"
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

func (repo *dataInitRepository) Init(ctx context.Context) (err error) {
	access := new(bddAccess.Writer)
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

	return doLaunchScript(ctx, access, config.GetSchemaPath())
}

func doLaunchScript(ctx context.Context, bddAccess bddAccess.WriteDataOperation, filepath string) error {
	nbRows, err := bddAccess.LaunchSQLScript(ctx, filepath)
	if err != nil {
		return err
	}
	log.Printf("Lancement sql %s => %v insertion(s), modification(s) ou suppression(s)", filepath, nbRows)
	return nil
}
