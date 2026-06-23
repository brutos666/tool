package service

import (
	"context"

	"goTool/entity"
	"goTool/mapper"
	"goTool/repository"
)

func FindAllUsers(ctx context.Context) ([]*entity.User, error) {
	usersFromBase, err := repository.FindAllUsers(ctx)
	if err != nil {
		return nil, err
	}
	// Conversion en arbre
	return mapper.ConvertUsersModelToUsers(usersFromBase), nil
}
