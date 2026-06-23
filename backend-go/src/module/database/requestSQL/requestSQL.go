package requestSQL

import (
	"context"
	"os"
	"strings"

	"database/server/connection"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// Fonction pour initialiser la base de données avec les tables si elles n'existent pas
func CreateTables(baseConnection connection.DatabaseConnection, filePath string) error {
	db := connection.OpenConnection(baseConnection)
	defer Close(db)
	// Lecture du fichier SQL contenant les instructions de création des tables
	sqlBytes, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}
	// Exécution des instructions SQL pour créer les tables
	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		return err
	}
	return nil
}

func Open(base connection.DatabaseConnection) *sqlx.DB {
	return connection.OpenConnection(base)
}

func Close(db *sqlx.DB) {
	db.Close()
}

func SetModeTrans(db *sqlx.DB) (*sqlx.Tx, error) {
	return db.Beginx()
}

func Rollback(tx *sqlx.Tx) error {
	return tx.Rollback()
}

func Commit(tx *sqlx.Tx) error {
	return tx.Commit()
}

func Select(ctx context.Context, db *sqlx.DB, dest interface{}, query string) error {
	return db.SelectContext(ctx, dest, query)
}

func ExecIn(ctx context.Context, tx *sqlx.Tx, query string, inName string, inValues interface{}) (int, error) {
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
	query = tx.Rebind(query)
	return returnResult(tx.ExecContext(ctx, query, args...))
}

func ExecArgs(ctx context.Context, tx *sqlx.Tx, query string, args ...any) (int, error) {
	query = tx.Rebind(query)
	return returnResult(tx.ExecContext(ctx, query, args...))
}

func Exec(ctx context.Context, tx *sqlx.Tx, query string, values interface{}) (int, error) {
	return returnResult(tx.NamedExecContext(ctx, query, values))
}

func ExecWithReturn(ctx context.Context, tx *sqlx.Tx, values interface{}, dest interface{}, query string) error {
	query, args, err := sqlx.Named(query, values)
	if err != nil {
		return err
	}
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
