package domain

import (
	"context"
)

type SpaceCommandRepository interface {
	SaveCurrentSpace(ctx context.Context, nodeSpace *NodeSpace) error
	SaveSpaces(ctx context.Context, spaces *Spaces) error
}

type SpaceQueryRepository interface {
	FindAll(ctx context.Context) ([]*Space, error)
}
