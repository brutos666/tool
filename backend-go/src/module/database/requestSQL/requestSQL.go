package requestSQL

import (
	"os"
	"strings"

	"database/server/connection"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

func LaunchSQLScript(connection connection.Connection, filePath string) (int, error) {
	// Lecture du fichier SQL contenant les instructions de création des tables
	sqlBytes, err := os.ReadFile(filePath)
	if err != nil {
		return 0, err
	}
	return returnResult(connection.GetDb().ExecContext(connection.GetContext(), string(sqlBytes)))
}

func Select(connection connection.Connection, dest interface{}, query string, args ...interface{}) error {
	tx := connection.GetTx()
	if strings.Contains(query, "?") {
		query = tx.Rebind(query)
	}
	return connection.GetDb().SelectContext(connection.GetContext(), dest, query, args...)
}

func ExecIn(connection connection.Connection, query string, inName string, inValues interface{}) (int, error) {
	query = strings.Replace(query, "?", ":"+inName, 1)
	arg := make(map[string]interface{}, 0)
	arg[inName] = inValues

	query, args, err := sqlx.Named(query, arg)
	if err != nil {
		return 0, err
	}
	query, args, err = sqlx.In(query, args...)
	if err != nil {
		return 0, err
	}
	tx := connection.GetTx()
	query = tx.Rebind(query)
	return returnResult(tx.ExecContext(connection.GetContext(), query, args...))
}

func ExecArgs(connection connection.Connection, query string, args ...any) (int, error) {
	tx := connection.GetTx()
	query = tx.Rebind(query)
	return returnResult(tx.ExecContext(connection.GetContext(), query, args...))
}

func Exec(connection connection.Connection, query string, values interface{}) (int, error) {
	tx := connection.GetTx()
	return returnResult(tx.NamedExecContext(connection.GetContext(), query, values))
}

func ExecWithReturn(connection connection.Connection, values interface{}, dest interface{}, query string) error {
	query, args, err := sqlx.Named(query, values)
	if err != nil {
		return err
	}
	tx := connection.GetTx()
	query = tx.Rebind(query)
	return tx.GetContext(connection.GetContext(), dest, query, args...)
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
