package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"

	"goTool/config"
	"goTool/domain"
	"goTool/infrastructure/entityBdd"
)

const SELECT_ALL_USERS string = "SELECT id, first_name, last_name, password, email, role FROM users"

type userQryRepository struct{}

func UserQueryRepository() domain.UserQueryRepository {
	return &userQryRepository{}
}

func (repo *userQryRepository) FindAll(ctx context.Context) ([]*domain.User, error) {
	return connection.LaunchNormalWay(ctx, config.GetBaseConnection(), selectAllUsers, "")
}

func selectAllUsers(connection connection.Connection, notUsed string) ([]*domain.User, error) {
	var usersModel []entityBdd.UserModel
	err := requestSQL.Select(connection, &usersModel, SELECT_ALL_USERS)
	if err != nil {
		return nil, err
	}
	users := make([]*domain.User, len(usersModel))
	for index := range usersModel {
		users[index] = usersModel[index].ConvertToUser()
	}
	return users, nil
}
