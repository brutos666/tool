package domain

import "context"

type ItemCommandRepository interface {
	Save(ctx context.Context, item *ItemToSave) error
}

type ItemQueryRepository interface {
	FindAll(ctx context.Context) ([]*ItemFound, error)
}
