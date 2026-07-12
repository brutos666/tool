package domain

import (
	"context"
)

type SpaceCommandRepository interface {
	SaveCurrentSpace(ctx context.Context, dataAccess DataAccess, nodeSpace *NodeSpace) error
	SaveSpaces(ctx context.Context, dataAccess DataAccess, spaces *Spaces) error
}

type SpaceQueryRepository interface {
	FindAll(ctx context.Context, dataAccess DataAccess) ([]*Space, error)
}
