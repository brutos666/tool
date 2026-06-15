package requestSQL

import (
	"database/server/connection"
	"database/sql"
	"strings"

	"github.com/jmoiron/sqlx"
)

func Open(base connection.DatabaseConnection) (*sqlx.DB) {
	return connection.OpenConnection(base)
}
func Close(db *sqlx.DB) {
	db.Close()
}

func SetModeTrans(db *sqlx.DB) (*sqlx.Tx,  error){
	return db.Beginx()
}
func Rollback(tx *sqlx.Tx) (error) {
	return tx.Rollback()
}
func Commit(tx *sqlx.Tx) (error) {
	return tx.Commit()
}

func Select(db *sqlx.DB, dest interface{}, query string) (error) {
	return db.Select(dest, query)
}

func ExecIn(tx *sqlx.Tx, query string, inName string, inValues interface{}) (int, error) {
	query = strings.Replace(query, "?", ":"+inName, 1)
	arg := make(map[string]interface{}, 0)
	arg[inName] = inValues

	query, args, err := sqlx.Named(query, arg)
	if (err != nil) {
		return 0, err
	}
	query, args, err = sqlx.In(query, args...)
	if (err != nil) {
		return 0, err
	}
	query = tx.Rebind(query)
	return returnResult(tx.Exec(query, args...))
}
func ExecArgs(tx *sqlx.Tx, query string, args ...any) (int, error) {
	query = tx.Rebind(query)
	return returnResult(tx.Exec(query, args...))
}

func Exec(tx *sqlx.Tx, query string, values interface{}) (int, error) {
	return returnResult(tx.NamedExec(query, values))
}
func ExecWithReturn(tx *sqlx.Tx, values interface{}, dest interface{}, query string)  (error) {
	query, args, err := sqlx.Named(query, values)
	if (err != nil) {
		return err
	}
	query = tx.Rebind(query)
	return tx.Get(dest, query, args...)
}

func returnResult(result sql.Result, err error) (int, error) {
	if (err != nil) {
		return 0, err
	}
	nbRows, errRows := result.RowsAffected()
	if (errRows != nil) {
			return 0, errRows
	}
	return int(nbRows), errRows
}