package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"

	"goTool/domain"
	"goTool/infrastructure/bddAccess"
	"goTool/infrastructure/entityBdd"
)

const SELECT_ALL_USERS string = "SELECT id, first_name, last_name, password, email, role FROM users"

type userQryRepository struct{}

func UserQueryRepository() domain.UserQueryRepository {
	return &userQryRepository{}
}

func (repo *userQryRepository) FindAll(ctx context.Context, dataAccess domain.DataAccess) ([]*domain.User, error) {
	return selectAllUsers(ctx, dataAccess.(bddAccess.Access).GetConnection())
}

func selectAllUsers(ctx context.Context, connection connection.Connection) ([]*domain.User, error) {
	var usersModel []entityBdd.UserModel
	err := requestSQL.Select(ctx, connection, &usersModel, SELECT_ALL_USERS)
	if err != nil {
		return nil, err
	}
	users := make([]*domain.User, len(usersModel))
	for index := range usersModel {
		users[index] = usersModel[index].ConvertToUser()
	}
	return users, nil
}
