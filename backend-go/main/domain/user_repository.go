package domain

import (
	"context"
)

type UserCommandRepository interface {
	CreateUserIfNotExists(ctx context.Context, dataAccess DataAccess, user *User, hashPassword string) (alreadyExists bool, err error)
	GetUsersWithEmail(ctx context.Context, dataAccess DataAccess, email string) ([]User, error)
	UpdateToken(ctx context.Context, dataAccess DataAccess, userId string, tokenGenerator Tokens) error
}

type UserQueryRepository interface {
	FindAll(ctx context.Context, dataAccess DataAccess) ([]*User, error)
}
