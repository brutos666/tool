package domain

import "context"

type DataInitRepository interface {
	Init(ctx context.Context) error
}

type SpaceCommandRepository interface {
	SaveCurrentSpace(ctx context.Context, dataAccessId int, nodeSpace *NodeSpace) error
	SaveSpaces(ctx context.Context, dataAccessId int, spaces *Spaces) error
}
type SpaceQueryRepository interface {
	FindAll(ctx context.Context, dataAccessId int) ([]*Space, error)
}

type UserCommandRepository interface {
	CreateUserIfNotExists(ctx context.Context, dataAccessId int, user *User, hashPassword string) (alreadyExists bool, err error)
	GetUsersWithEmail(ctx context.Context, dataAccessId int, email string) ([]User, error)
	UpdateToken(ctx context.Context, dataAccessId int, userId string, tokenGenerator TokensProduct) error
}
type UserQueryRepository interface {
	FindAll(ctx context.Context, dataAccessId int) ([]*User, error)
}
