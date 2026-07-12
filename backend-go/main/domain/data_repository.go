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
