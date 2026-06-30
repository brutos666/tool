package repository

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"time"

	"goTool/entity"
	"goTool/errorHelper/specificError"
)

const (
	SELECT_ALL_USERS  string = "SELECT id, first_name, last_name, password, email, role FROM users"
	SELECT_WITH_EMAIL string = "SELECT id, first_name, last_name, password, email, role FROM users WHERE email = ?"
	INSERT_USER       string = "INSERT INTO users (first_name, last_name, password, email, token, role, refresh_token, created_at, updated_at) values(:first_name, :last_name, :password, :email, :token, :role, :refresh_token, :created_at, :updated_at) RETURNING *"
)

type userInfosArgs struct {
	user                                    entity.User
	hashPassword, accessToken, refreshToken string
}

func Signup(ctx context.Context, user entity.User, hashPassword, accessToken, refreshToken string) (signedUser *entity.UserModel, err error) {
	userModels, err := connection.LaunchTransactionnelWay(ctx, BaseConnection, doSignUp, userInfosArgs{user, hashPassword, accessToken, refreshToken})
	if err != nil {
		return nil, err
	}
	return &userModels[0], err
}

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

func doSignUp(connection connection.Connection, userInfos userInfosArgs) ([]entity.UserModel, error) {
	// Vérification si l'utilisateur existe déjà
	var existingUsers []entity.UserModel
	err := requestSQL.Select(connection, &existingUsers, SELECT_WITH_EMAIL, userInfos.user.GetEmail())
	if err != nil {
		return nil, err
	}
	if len(existingUsers) > 0 {
		functionalErr := specificError.Errorf("L'utilisateur avec l'email %s existe déjà", userInfos.user.GetEmail())
		functionalErr.AddContext("email", userInfos.user.GetEmail())
		return nil, functionalErr
	}
	role := userInfos.user.GetRole()

	userModel := userInfos.user.ConvertToUserModel()
	userModel.CreatedAt = time.Now()
	userModel.UpdatedAt = time.Now()
	userModel.Password = &userInfos.hashPassword
	userModel.Role = &role
	userModel.Token = &userInfos.accessToken
	userModel.RefreshToken = &userInfos.refreshToken

	err = requestSQL.ExecWithReturn(connection, *userModel, userModel, INSERT_USER)
	if err != nil {
		return nil, err
	}
	return []entity.UserModel{*userModel}, err
}
