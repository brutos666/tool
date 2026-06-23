package repository

import (
	"context"
	"database/server/requestSQL"

	"goTool/entity"
)

const SELECT_ALL_USERS string = "SELECT id, first_name, last_name, password, email, role FROM users"

func FindAllUsers(ctx context.Context) ([]entity.UserModel, error) {
	var usersModel []entity.UserModel
	db := requestSQL.Open(BaseConnection)
	defer requestSQL.Close(db)
	err := requestSQL.Select(ctx, db, &usersModel, SELECT_ALL_USERS)
	return usersModel, err
}
