package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"time"

	"goTool/config"
	"goTool/domain"
	"goTool/infrastructure/entityBdd"
)

const (
	SELECT_WITH_EMAIL string = "SELECT id, first_name, last_name, password, email, role FROM users WHERE email = ?"
	INSERT_USER       string = "INSERT INTO users (first_name, last_name, password, email, token, role, refresh_token, created_at, updated_at) values(:first_name, :last_name, :password, :email, :token, :role, :refresh_token, :created_at, :updated_at) RETURNING *"
	UPDATE_USER_TOKEN string = "UPDATE users SET token=?, refresh_token=?, updated_at=? where id=?"
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
type updateTokenArgs struct {
	userId, accessToken, refreshToken string
}

func (infos *userInfosArgs) setAlreadyExists() { *infos.alreadyExists = true }

// Signup implements [domain.UserCommandRepository].
func (repository *userCmdRepository) CreateUserIfNotExists(ctx context.Context, user *domain.User, hashPassword string, accessToken string, refreshToken string) (alreadyExists bool, err error) {
	err = connection.LaunchTransactionnelWay(ctx, config.GetBaseConnection(), doCreateUserIfNotExists, userInfosArgs{user, hashPassword, accessToken, refreshToken, &alreadyExists})
	return alreadyExists, err
}

func (repository *userCmdRepository) GetUsersWithEmail(ctx context.Context, email string) ([]domain.User, error) {
	return connection.LaunchNormalWay(ctx, config.GetBaseConnection(), getUsersWithMail, email)
}

func (repository *userCmdRepository) UpdateToken(ctx context.Context, userId string, accessToken, refreshToken string) error {
	return connection.LaunchTransactionnelWay(ctx, config.GetBaseConnection(), doUpdateUser, updateTokenArgs{userId, accessToken, refreshToken})
}

func doCreateUserIfNotExists(connection connection.Connection, userInfos userInfosArgs) error {
	// Vérification si l'utilisateur existe déjà
	userModels, err := selectUsers(connection, userInfos.user.GetEmail())
	if err != nil {
		return err
	}
	if len(userModels) > 0 {
		userInfos.setAlreadyExists()
		return nil
	}

	return insertUser(connection, userInfos.user, userInfos.hashPassword, userInfos.accessToken, userInfos.refreshToken)
}

func doUpdateUser(connection connection.Connection, args updateTokenArgs) error {
	return updateUserToken(connection, args.userId, args.accessToken, args.refreshToken)
}

func getUsersWithMail(connection connection.Connection, email string) ([]domain.User, error) {
	userModels, err := selectUsers(connection, email)
	if err != nil {
		return nil, err
	}
	if len(userModels) > 0 {
		users := make([]domain.User, len(userModels))
		for index := range userModels {
			users[index] = *userModels[index].ConvertToUser()
		}
		return users, nil
	}
	return []domain.User{}, nil
}

func selectUsers(connection connection.Connection, email string) ([]entityBdd.UserModel, error) {
	var existingUsers []entityBdd.UserModel
	err := requestSQL.Select(connection, &existingUsers, SELECT_WITH_EMAIL, email)
	if err != nil {
		return nil, err
	}
	return existingUsers, nil
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

func updateUserToken(connection connection.Connection, userId, accessToken, refreshToken string) error {
	_, err := requestSQL.ExecArgs(connection, UPDATE_USER_TOKEN, accessToken, refreshToken, time.Now(), userId)
	return err
}
