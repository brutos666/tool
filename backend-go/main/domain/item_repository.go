package domain

import (
	"context"
)

type ItemCommandRepository interface {
	SaveCurrentSpace(ctx context.Context, nodeSpace *NodeSpace) error
	SaveSpaces(ctx context.Context, spaces *Spaces) error
}

type ItemQueryRepository interface {
	FindAll(ctx context.Context) ([]*ItemFound, error)
}
