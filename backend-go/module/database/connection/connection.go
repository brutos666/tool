package connection

import (
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type DatabaseConnection interface {
	GetDriverName() string
	GetDataSourceName() string
}

type Connection struct {
	db        *sqlx.DB
	tx        *sqlx.Tx
	modeTrans bool
}

func (connection Connection) GetDb() *sqlx.DB   { return connection.db }
func (connection Connection) GetTx() *sqlx.Tx   { return connection.tx }
func (connection Connection) IsModeTrans() bool { return connection.modeTrans }

func OpenTransactionnelConnection(base DatabaseConnection) (*Connection, error) {
	db := OpenConnection(base)
	tx, err := db.Beginx()
	if err != nil {
		return nil, err
	}
	connection := new(Connection)
	connection.db = db
	connection.tx = tx
	connection.modeTrans = true
	return connection, nil
}

func OpenAutoCommitConnection(base DatabaseConnection) (*Connection, error) {
	db := OpenConnection(base)
	connection := new(Connection)
	connection.db = db
	connection.tx = nil
	connection.modeTrans = false
	return connection, nil
}

func Close(connection *Connection) error {
	return connection.db.Close()
}

func Rollback(connection *Connection) error {
	if connection.modeTrans {
		connection.modeTrans = false
		return connection.tx.Rollback()
	}
	return nil
}

func Commit(connection *Connection) error {
	if connection.modeTrans {
		connection.modeTrans = false
		return connection.tx.Commit()
	}
	return nil
}

func OpenConnection(base DatabaseConnection) *sqlx.DB {
	driverName := base.GetDriverName()
	db, err := sqlx.Open(driverName, base.GetDataSourceName())
	if err != nil {
		log.Fatalf("Base %s : impossible de se connecter (%s)", driverName, err)
	}
	err = db.Ping()
	if err != nil {
		log.Fatalf("Base %s : impossible de ping (%s)", driverName, err)
	}
	return db
}

func WaitForProcess(base DatabaseConnection) error {
	conn := OpenConnection(base)
	defer conn.Close()

	var err error

	for range 10 {
		if err = conn.Ping(); err == nil {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	return err
}
