package service

import (
	"authentication/password"
	"authentication/token"
	"context"
	"strconv"

	"goTool/entity"
	"goTool/mapper"
	"goTool/repository"
)

func Signup(ctx context.Context, user entity.User) (*entity.User, error) {
	password := password.HashPassword(user.GetPassword())
	accessToken, refreshToken := token.GenerateTokens(user.GetEmail(), strconv.Itoa(user.GetID()), user.GetRole())

	savedUserFromBase, err := repository.Signup(ctx, user, password, accessToken, refreshToken)
	if err != nil {
		return nil, err
	}
	return savedUserFromBase.ConvertToUser(), nil
}

func FindAllUsers(ctx context.Context) ([]*entity.User, error) {
	usersFromBase, err := repository.FindAllUsers(ctx)
	if err != nil {
		return nil, err
	}
	// Conversion en arbre
	return mapper.ConvertUsersModelToUsers(usersFromBase), nil
}
