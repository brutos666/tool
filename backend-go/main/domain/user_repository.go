package domain

import "context"

type UserCommandRepository interface {
	Signup(ctx context.Context, user *User, hashPassword, accessToken, refreshToken string) error
}

type UserQueryRepository interface {
	FindAll(ctx context.Context) ([]*User, error)
}
