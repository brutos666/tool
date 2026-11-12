package repository

import (
	"context"

	"goTool/internal/api/domain"
	"goTool/internal/api/infrastructure/bddService"
	"goTool/internal/api/infrastructure/entityBdd"
)

const SELECT_ALL_USERS string = "SELECT id, first_name, last_name, password, email, role FROM users"

type userQryRepository struct{}

func UserQuery() domain.UserQueryRepository {
	return &userQryRepository{}
}

func (repo *userQryRepository) FindAll(ctx context.Context, dataAccessId int) ([]*domain.User, error) {
	return selectAllUsers(ctx, bddAccessService.RetrieveReadAccess(dataAccessId))
}

func selectAllUsers(ctx context.Context, dataBase bddService.ReadCommands) ([]*domain.User, error) {
	var usersModel []entityBdd.UserModel
	err := dataBase.Select(ctx, SELECT_ALL_USERS, &usersModel)
	if err != nil {
		return nil, err
	}
	users := make([]*domain.User, len(usersModel))
	for index := range usersModel {
		users[index] = usersModel[index].ConvertToUser()
	}
	return users, nil
}
