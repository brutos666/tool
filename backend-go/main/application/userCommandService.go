package application

import (
	"authentication/password"
	"authentication/token"
	"context"

	"goTool/domain"
)

type UserCmdService struct {
	repository domain.UserCommandRepository
}

func UserCommandService(repository domain.UserCommandRepository) UserCmdService {
	return UserCmdService{repository: repository}
}

func (commandService UserCmdService) Signup(ctx context.Context, user *domain.User) (*domain.User, error) {
	password := password.HashPassword(user.GetPassword())
	accessToken, refreshToken := token.GenerateTokens(user.GetEmail(), user.GetId(), user.GetRole())

	err := commandService.repository.Signup(ctx, user, password, accessToken, refreshToken)
	if err != nil {
		return nil, err
	}
	return user, nil
}
