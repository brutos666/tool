package repository

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"

	"goTool/entity"
)

const (
	SELECT_ALL_USERS string = "SELECT id, first_name, last_name, password, email, role FROM users"
)

func FindAllUsers(ctx context.Context) ([]entity.UserModel, error) {
	return connection.LaunchNormalWay(ctx, BaseConnection, selectAllUsers, "")
}

func selectAllUsers(connection connection.Connection, notUsed string) ([]entity.UserModel, error) {
	var usersModel []entity.UserModel
	err := requestSQL.Select(connection, &usersModel, SELECT_ALL_USERS)
	if err != nil {
		return nil, err
	}
	return usersModel, nil
}
