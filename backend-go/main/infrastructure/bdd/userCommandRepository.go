package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"

	"goTool/domain"
	"goTool/infrastructure/bdd/configuration"
	"goTool/infrastructure/entityBdd"
)

const (
	SELECT_WITH_EMAIL string = "SELECT id, first_name, last_name, password, email, role FROM users WHERE email = ?"
	INSERT_USER       string = "INSERT INTO users (first_name, last_name, password, email, token, role, refresh_token, created_at, updated_at) values(:first_name, :last_name, :password, :email, :token, :role, :refresh_token, :created_at, :updated_at) RETURNING *"
)

type userCmdRepository struct{}

func UserCommandRepository() domain.UserCommandRepository {
	return &userCmdRepository{}
}

type userInfosArgs struct {
	user                                    *domain.User
	hashPassword, accessToken, refreshToken string
	alreadyExists                           *bool
}

func (infos *userInfosArgs) setAlreadyExists() { *infos.alreadyExists = true }

// Signup implements [domain.UserCommandRepository].
func (repository *userCmdRepository) CreateUserIfNotExists(ctx context.Context, user *domain.User, hashPassword string, accessToken string, refreshToken string) (alreadyExists bool, err error) {
	err = connection.LaunchTransactionnelWay(ctx, configuration.BaseConnection, doCreateUserIfNotExists, userInfosArgs{user, hashPassword, accessToken, refreshToken, &alreadyExists})
	return alreadyExists, err
}

func doCreateUserIfNotExists(connection connection.Connection, userInfos userInfosArgs) error {
	// Vérification si l'utilisateur existe déjà
	var existingUsers []entityBdd.UserModel
	err := requestSQL.Select(connection, &existingUsers, SELECT_WITH_EMAIL, userInfos.user.GetEmail())
	if err != nil {
		return err
	}
	if len(existingUsers) > 0 {
		userInfos.setAlreadyExists()
		return nil
	}

	return insertUser(connection, userInfos.user, userInfos.hashPassword, userInfos.accessToken, userInfos.refreshToken)
}

func insertUser(connection connection.Connection, user *domain.User, hashPassword, accessToken, refreshToken string) error {
	userModel := *entityBdd.CreateUserToRegister(*user, hashPassword, accessToken, refreshToken)

	err := requestSQL.ExecWithReturn(connection, userModel, &userModel, INSERT_USER)
	if err != nil {
		return err
	}
	user.SetId(userModel.GetId())
	return nil
}
