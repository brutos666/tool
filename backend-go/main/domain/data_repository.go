package domain

import "context"

type DataInitRepository interface {
	Init(ctx context.Context) error
}
