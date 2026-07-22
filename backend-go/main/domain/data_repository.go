package domain

import "context"

type DataInitRepository interface {
	Init(ctx context.Context) error
}
type DataAccessProvider interface {
	GetInstance() DataAccess
}
type DataAccess interface {
	Open() error
	Close() error
	Cancel() error
}
