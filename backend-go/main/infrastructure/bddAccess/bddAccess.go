package bddAccess

import (
	"database/server/connection"

	"goTool/config"
	"goTool/domain"
)

type Service struct {
	accessForRead bool
}

func (service Service) GetInstance() domain.DataAccess {
	if service.accessForRead {
		return new(Reader)
	}
	return new(Writer)
}

func AsRead() Service {
	return Service{accessForRead: true}
}

func AsWrite() Service {
	return Service{accessForRead: false}
}

type Access interface {
	GetConnection() connection.Connection
	Start() error
	Stop() error
	Cancel() error
}

type Reader struct {
	connection *connection.Connection
}

func (bddAccess Reader) GetConnection() connection.Connection { return *bddAccess.connection }

func (bddAccess *Reader) Start() error {
	connection, err := connection.OpenAutoCommitConnection(config.GetBaseConnection())
	if err != nil {
		return err
	}
	bddAccess.connection = connection
	return nil
}

func (bddAccess *Reader) Stop() error {
	return connection.Close(bddAccess.connection)
}

func (bddAccess *Reader) Cancel() error { return nil }

type Writer struct {
	connection *connection.Connection
}

func (bddAccess Writer) GetConnection() connection.Connection { return *bddAccess.connection }

func (bddAccess *Writer) Start() error {
	connection, err := connection.OpenTransactionnelConnection(config.GetBaseConnection())
	if err != nil {
		return err
	}
	bddAccess.connection = connection
	return nil
}

func (bddAccess *Writer) Stop() error {
	err := connection.Commit(bddAccess.connection)
	if err != nil {
		return err
	}
	return connection.Close(bddAccess.connection)
}

func (bddAccess *Writer) Cancel() error {
	return connection.Rollback(bddAccess.connection)
}
