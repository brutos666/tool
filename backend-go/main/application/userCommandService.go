package application

import (
	"authentication/password"
	"authentication/token"
	"context"

	"goTool/domain"
	"goTool/domain/domainMessage"
)

const USER_CREATED string = "Le compte de l'utilisateur a été créé avec succès"

type UserCmdService struct {
	repository domain.UserCommandRepository
}

func UserCommandService(repository domain.UserCommandRepository) UserCmdService {
	return UserCmdService{repository: repository}
}

func (commandService UserCmdService) Signup(ctx context.Context, user *domain.User) (*domainMessage.Message, error) {
	password := password.HashPassword(user.GetPassword())
	accessToken, refreshToken := token.GenerateTokens(user.GetEmail(), user.GetId(), user.GetRole())

	alreadyExists, err := commandService.repository.CreateUserIfNotExists(ctx, user, password, accessToken, refreshToken)
	if err != nil {
		return nil, err
	}
	if alreadyExists {
		error := domainMessage.Errorf("L'utilisateur avec l'email %s existe déjà", user.GetEmail())
		error.AddContext("email", user.GetEmail())
		return nil, error
	}
	return domainMessage.New(USER_CREATED), nil
}
