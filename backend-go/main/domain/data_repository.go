package domain

import "context"

type DataInitRepository interface {
	Init(ctx context.Context, dataAccess DataAccess) error
}
type DataAccessProvider interface {
	GetInstance() DataAccess
}
type DataAccess interface {
	Open() error
	Close() error
	Cancel() error
}

type NilDataAccessProvider struct{}

func (access *NilDataAccessProvider) GetInstance() DataAccess { return nil }
