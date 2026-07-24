package bddService

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"

	"goTool/config"
	"goTool/generic"
)

// Nombre max de connections simultanées
const (
	MAX_CONNECTION = 5
	WRITE          = "W"
	READ           = "R"
)

// Provider : fourni un accès en lecture ou en écriture à la base de données
type Provider struct{}

func (p Provider) ProvideAccess(accessType string) generic.DataAccess {
	var dataAccess generic.DataAccess
	switch accessType {
	case READ:
		dataAccess = &Reader{}
	case WRITE:
		dataAccess = &Writer{Reader{}}
	default:
		panic("Type d'accès à la base de données inexistant : doit être READ ou WRITE")
	}
	return dataAccess
}

// Reader permet l'ouverture de la connection et des commands de lecture
type Reader struct {
	connection *connection.Connection
}

func (bddAccess *Reader) Open() error {
	connection, err := connection.OpenAutoCommitConnection(config.GetBaseConnection())
	if err != nil {
		return err
	}
	bddAccess.connection = connection
	return nil
}

func (bddAccess *Reader) Close() error {
	return connection.Close(bddAccess.connection)
}

func (bddAccess Reader) Cancel() error { return nil }

func (bddAccess Reader) Select(ctx context.Context, sql string, modelsOut any, args ...any) error {
	return requestSQL.Select(ctx, *bddAccess.connection, modelsOut, sql, args...)
}

// Writer permet l'ouverture de la connection en mode transactionnel et des commands de lecture et d'écriture
type Writer struct {
	Reader
}

func (bddAccess *Writer) Open() error {
	connection, err := connection.OpenTransactionnelConnection(config.GetBaseConnection())
	if err != nil {
		return err
	}
	bddAccess.connection = connection
	return nil
}

func (bddAccess *Writer) Close() error {
	err := connection.Commit(bddAccess.connection)
	if err != nil {
		return err
	}
	return connection.Close(bddAccess.connection)
}

func (bddAccess *Writer) Cancel() error {
	return connection.Rollback(bddAccess.connection)
}

func (bddAccess Writer) Insert(ctx context.Context, sql string, modelInOut any) error {
	return requestSQL.ExecWithReturn(ctx, *bddAccess.connection, modelInOut, modelInOut, sql)
}

func (bddAccess Writer) Update(ctx context.Context, sql string, args ...any) (int, error) {
	return requestSQL.ExecArgs(ctx, *bddAccess.connection, sql, args...)
}

func (bddAccess Writer) UpdateModel(ctx context.Context, sql string, modelIn any) (int, error) {
	return requestSQL.Exec(ctx, *bddAccess.connection, sql, modelIn)
}

func (bddAccess Writer) DeleteIn(ctx context.Context, sql string, inValues []string) (int, error) {
	argList := []any{inValues}
	return requestSQL.ExecIn(ctx, *bddAccess.connection, sql, argList...)
}

func (bddAccess Writer) LaunchSQLScript(ctx context.Context, filepath string) (int, error) {
	return requestSQL.LaunchSQLScript(ctx, *bddAccess.connection, filepath)
}
