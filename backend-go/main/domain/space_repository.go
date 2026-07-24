package domain

import (
	"context"
)

type SpaceCommandRepository interface {
	SaveCurrentSpace(ctx context.Context, dataAccessId int, nodeSpace *NodeSpace) error
	SaveSpaces(ctx context.Context, dataAccessId int, spaces *Spaces) error
}

type SpaceQueryRepository interface {
	FindAll(ctx context.Context, dataAccessId int) ([]*Space, error)
}
