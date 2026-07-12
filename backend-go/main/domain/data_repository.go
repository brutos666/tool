package domain

import "context"

type DataInitRepository interface {
	Init(ctx context.Context, dataAccess DataAccess) error
}

type DataAccess interface {
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	Cancel(ctx context.Context) error
}
