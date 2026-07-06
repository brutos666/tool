package domain

import "context"

type UserCommandRepository interface {
	CreateUserIfNotExists(ctx context.Context, user *User, hashPassword, accessToken, refreshToken string) (alreadyExists bool, err error)
}

type UserQueryRepository interface {
	FindAll(ctx context.Context) ([]*User, error)
}
