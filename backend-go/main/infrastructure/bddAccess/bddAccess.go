package bddAccess

import (
	"context"
	"database/server/connection"

	"goTool/config"
)

type Access interface {
	GetConnection() connection.Connection
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	Cancel(ctx context.Context) error
}

type Reader struct {
	connection *connection.Connection
}

func (bddAccess Reader) GetConnection() connection.Connection { return *bddAccess.connection }

func (bddAccess *Reader) Start(ctx context.Context) error {
	connection, err := connection.OpenAutoCommitConnection(ctx, config.GetBaseConnection())
	if err != nil {
		return err
	}
	bddAccess.connection = connection
	return nil
}

func (bddAccess *Reader) Stop(ctx context.Context) error {
	return connection.Close(bddAccess.connection)
}

func (bddAccess *Reader) Cancel(ctx context.Context) error { return nil }

type Writer struct {
	connection *connection.Connection
}

func (bddAccess Writer) GetConnection() connection.Connection { return *bddAccess.connection }

func (bddAccess *Writer) Start(ctx context.Context) error {
	connection, err := connection.OpenTransactionnelConnection(ctx, config.GetBaseConnection())
	if err != nil {
		return err
	}
	bddAccess.connection = connection
	return nil
}

func (bddAccess *Writer) Stop(ctx context.Context) error {
	err := connection.Commit(bddAccess.connection)
	if err != nil {
		return err
	}
	return connection.Close(bddAccess.connection)
}

func (bddAccess *Writer) Cancel(ctx context.Context) error {
	return connection.Rollback(bddAccess.connection)
}
