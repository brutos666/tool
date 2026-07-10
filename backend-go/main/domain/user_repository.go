package domain

import "context"

type UserCommandRepository interface {
	CreateUserIfNotExists(ctx context.Context, user *User, hashPassword string) (alreadyExists bool, err error)
	GetUsersWithEmail(ctx context.Context, email string) ([]User, error)
	UpdateToken(ctx context.Context, userId string, accessToken, refreshToken string) error
}

type UserQueryRepository interface {
	FindAll(ctx context.Context) ([]*User, error)
}
