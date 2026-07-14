package domain

import "context"

type DataInitRepository interface {
	Init(ctx context.Context, dataAccess DataAccess) error
}

type DataAccess interface {
	Start() error
	Stop() error
	Cancel() error
}

type NilDataAccess struct{}

func (access *NilDataAccess) Start() error  { return nil }
func (access *NilDataAccess) Stop() error   { return nil }
func (access *NilDataAccess) Cancel() error { return nil }
