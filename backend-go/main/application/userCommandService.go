package application

import (
	"authentication/password"
	"authentication/tokens"
	"context"

	"goTool/domain"
	"goTool/domain/domainMessage"
)

const (
	USER_CREATED     string = "Le compte de l'utilisateur a été créé avec succès"
	USER_CONNECTED   string = "L'utilisateur %v est connecté"
	WRONG_PASSWORD   string = "Mot de passe incorrect"
	EMAIL_NOT_UNIQUE string = "Plusieurs utilisateurs possèdent le même email : veuillez contacter l'administrateur"
	EMAIL_NOT_EXISTS string = "Il n'existe pas de compte utilisateur pour cet email"
)

type UserCmdService struct {
	repository domain.UserCommandRepository
}

func UserCommandService(repository domain.UserCommandRepository) UserCmdService {
	return UserCmdService{repository: repository}
}

func (commandService UserCmdService) Signup(ctx context.Context, user *domain.User) (*domainMessage.Message, error) {
	password := password.Hash(user.GetPassword())
	accessToken, refreshToken := tokens.Generate(user.GetEmail(), user.GetId(), user.GetRole())

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

func (commandService UserCmdService) Login(ctx context.Context, logUser *domain.LoginUser) (*domain.LoggedUser, error) {
	users, err := commandService.repository.GetUsersWithEmail(ctx, logUser.GetEmail())
	if err != nil {
		return nil, err
	}
	nbUser := len(users)
	if nbUser == 0 {
		err := domainMessage.NewError(EMAIL_NOT_EXISTS)
		err.AddContext("email", logUser.GetEmail())
		return nil, err
	}
	if nbUser > 1 {
		err := domainMessage.NewError(EMAIL_NOT_UNIQUE)
		err.AddContext("email", logUser.GetEmail())
		return nil, err
	}
	user := users[0]
	ok := password.Verify(user.GetPassword(), logUser.GetPassword())
	if !ok {
		err := domainMessage.NewError(WRONG_PASSWORD)
		err.AddContext("email", logUser.GetEmail())
		return nil, err
	}
	accessToken, refreshToken := tokens.Generate(user.GetEmail(), user.GetId(), user.GetRole())
	err = commandService.repository.UpdateToken(ctx, user.GetId(), accessToken, refreshToken)
	if err != nil {
		return nil, err
	}

	loggedUser := domain.CreateLoggedUser(user, accessToken, refreshToken)
	return loggedUser, nil
}
