package application

import (
	"authentication/password"
	"authentication/token"
	"context"

	"goTool/domain"
	"goTool/domain/specificError"
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

	alreadyExists, err := commandService.repository.CreateUserIfNotExists(ctx, user, password, accessToken, refreshToken)
	if err != nil {
		return nil, err
	}
	if alreadyExists {
		functionalErr := specificError.Errorf("L'utilisateur avec l'email %s existe déjà", user.GetEmail())
		functionalErr.AddContext("email", user.GetEmail())
		return nil, functionalErr
	}
	return user, nil
}
