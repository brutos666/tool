package repository

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"log"
)

func LaunchSQLScript(ctx context.Context, filePath string) error {
	nbRows, err := connection.LaunchTransactionnelWay(ctx, BaseConnection, doLaunchScript, filePath)
	log.Println("Nombre d'insertion, modification ou suppression :", nbRows[0])
	return err
}

func doLaunchScript(connection connection.Connection, filepath string) ([]int, error) {
	nbRows, err := requestSQL.LaunchSQLScript(connection, filepath)
	return []int{nbRows}, err
}
