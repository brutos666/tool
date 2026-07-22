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
	bddAccess := new(bddAccess.Writer)
	err = bddAccess.Open()
	if err != nil {
		return err
	}
	defer func() {
		err = utilities.JoinErrors(err, bddAccess.Close())
	}()
	defer func() {
		if err != nil {
			err = utilities.JoinErrors(err, bddAccess.Cancel())
		}
	}()

	return doLaunchScript(ctx, *bddAccess, config.GetSchemaPath())
}

func doLaunchScript(ctx context.Context, bddAccess bddAccess.Writer, filepath string) error {
	nbRows, err := bddAccess.LaunchSQLScript(ctx, filepath)
	if err != nil {
		return err
	}
	log.Printf("Lancement sql %s => %v insertion(s), modification(s) ou suppression(s)", filepath, nbRows)
	return nil
}
