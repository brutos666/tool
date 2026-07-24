package domain

import (
	"context"
)

type UserCommandRepository interface {
	CreateUserIfNotExists(ctx context.Context, dataAccessId int, user *User, hashPassword string) (alreadyExists bool, err error)
	GetUsersWithEmail(ctx context.Context, dataAccessId int, email string) ([]User, error)
	UpdateToken(ctx context.Context, dataAccessId int, userId string, tokenGenerator TokensProduct) error
}

type UserQueryRepository interface {
	FindAll(ctx context.Context, dataAccessId int) ([]*User, error)
}
