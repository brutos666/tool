package connection

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type DatabaseConnection interface {
	GetDriverName() string
	GetDataSourceName() string
}

type Connection struct {
	ctx       context.Context
	db        *sqlx.DB
	tx        *sqlx.Tx
	modeTrans bool
}

func (connection Connection) GetDb() *sqlx.DB             { return connection.db }
func (connection Connection) GetTx() *sqlx.Tx             { return connection.tx }
func (connection Connection) GetContext() context.Context { return connection.ctx }
func (connection Connection) IsModeTrans() bool           { return connection.modeTrans }

type (
	CallbackWithResult[R any, A any] func(Connection, A) ([]R, error)
	CallbackWithoutResult[A any]     func(Connection, A) error
)

// LaunchTransactionnelWay permet l'appel d'une fonction de mise à jour de la base de données en mode transactionnel
//
// Ouvre une connection à la base de données en mode transaction.
// Appel la fonction qui doit mettre à jour la base de données.
// Rollback et ferme la connection si une erreur survient.
// Commit et ferme la connection si tout se passe bien.
func LaunchTransactionnelWay[A any](ctx context.Context, base DatabaseConnection, callback CallbackWithoutResult[A], arguments A) (err error) {
	var connection *Connection
	connection, err = openTransactionnelConnection(ctx, base)
	if err != nil {
		return err
	}
	defer func() {
		err = errors.Join(err, close(connection))
	}()
	defer func() {
		err = errors.Join(err, rollback(connection))
	}()

	err = callback(*connection, arguments)
	if err != nil {
		return err
	}

	return commit(connection)
}

func LaunchNormalWay[R any, A any](ctx context.Context, base DatabaseConnection, callback CallbackWithResult[R, A], arguments A) (result []R, err error) {
	var connection *Connection
	connection, err = openAutoCommitConnection(ctx, base)
	if err != nil {
		return nil, err
	}
	defer func() {
		err = errors.Join(err, close(connection))
	}()

	result, err = callback(*connection, arguments)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func openTransactionnelConnection(ctx context.Context, base DatabaseConnection) (*Connection, error) {
	db := OpenConnection(base)
	tx, err := db.Beginx()
	if err != nil {
		return nil, err
	}
	connection := new(Connection)
	connection.ctx = ctx
	connection.db = db
	connection.tx = tx
	connection.modeTrans = true
	return connection, nil
}

func openAutoCommitConnection(ctx context.Context, base DatabaseConnection) (*Connection, error) {
	db := OpenConnection(base)
	connection := new(Connection)
	connection.ctx = ctx
	connection.db = db
	connection.tx = nil
	connection.modeTrans = false
	return connection, nil
}

func close(connection *Connection) error {
	return connection.db.Close()
}

func rollback(connection *Connection) error {
	if connection.modeTrans {
		connection.modeTrans = false
		return connection.tx.Rollback()
	}
	return nil
}

func commit(connection *Connection) error {
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
	log.Printf("Base %s : connectée", driverName)
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
