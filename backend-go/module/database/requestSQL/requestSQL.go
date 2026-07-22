package requestSQL

import (
	"context"
	"os"
	"strings"

	"database/server/connection"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

func LaunchSQLScript(ctx context.Context, connection connection.Connection, filePath string) (int, error) {
	// Lecture du fichier SQL contenant les instructions de création des tables
	sqlBytes, err := os.ReadFile(filePath)
	if err != nil {
		return 0, err
	}
	return returnResult(connection.GetTx().ExecContext(ctx, string(sqlBytes)))
}

func Select(ctx context.Context, connection connection.Connection, dest interface{}, query string, args ...interface{}) error {
	db := connection.GetDb()
	if strings.Contains(query, "?") {
		query = db.Rebind(query)
	}
	return db.SelectContext(ctx, dest, query, args...)
}

func ExecIn(ctx context.Context, connection connection.Connection, query string, argList ...any) (int, error) {
	query, args, err := sqlx.In(query, argList...)
	if err != nil {
		return 0, err
	}
	return ExecArgs(ctx, connection, query, args...)
}

func ExecArgs(ctx context.Context, connection connection.Connection, query string, args ...any) (int, error) {
	tx := connection.GetTx()
	query = tx.Rebind(query)
	return returnResult(tx.ExecContext(ctx, query, args...))
}

func Exec(ctx context.Context, connection connection.Connection, query string, values interface{}) (int, error) {
	tx := connection.GetTx()
	return returnResult(tx.NamedExecContext(ctx, query, values))
}

func ExecWithReturn(ctx context.Context, connection connection.Connection, values interface{}, dest interface{}, query string) error {
	query, args, err := sqlx.Named(query, values)
	if err != nil {
		return err
	}
	tx := connection.GetTx()
	query = tx.Rebind(query)
	return tx.GetContext(ctx, dest, query, args...)
}

func returnResult(result sql.Result, err error) (int, error) {
	if err != nil {
		return 0, err
	}
	nbRows, errRows := result.RowsAffected()
	if errRows != nil {
		return 0, errRows
	}
	return int(nbRows), errRows
}
