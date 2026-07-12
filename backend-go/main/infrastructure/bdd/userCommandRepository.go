package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"
	"time"

	"goTool/domain"
	"goTool/infrastructure/bddAccess"
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

// Signup implements [domain.UserCommandRepository].
func (repository *userCmdRepository) CreateUserIfNotExists(ctx context.Context, dataAccess domain.DataAccess, user *domain.User, hashPassword string) (alreadyExists bool, err error) {
	return doCreateUserIfNotExists(dataAccess.(bddAccess.Access).GetConnection(), user, hashPassword)
}

func (repository *userCmdRepository) GetUsersWithEmail(ctx context.Context, dataAccess domain.DataAccess, email string) ([]domain.User, error) {
	return getUsersWithMail(dataAccess.(bddAccess.Access).GetConnection(), email)
}

func (repository *userCmdRepository) UpdateToken(ctx context.Context, dataAccess domain.DataAccess, userId string, tokenGenerator domain.Tokens) error {
	accessToken, refreshToken := tokenGenerator.Generate()
	return doUpdateUser(dataAccess.(bddAccess.Access).GetConnection(), userId, accessToken, refreshToken)
}

func doCreateUserIfNotExists(connection connection.Connection, user *domain.User, hashPassword string) (alreadyExist bool, err error) {
	// Vérification si l'utilisateur existe déjà
	userModels, err := selectUsers(connection, user.GetEmail())
	if err != nil {
		return false, err
	}
	if len(userModels) > 0 {
		return true, nil
	}

	return false, insertUser(connection, user, hashPassword)
}

func doUpdateUser(connection connection.Connection, userId, accessToken, refreshToken string) error {
	return updateUserToken(connection, userId, accessToken, refreshToken)
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

func insertUser(connection connection.Connection, user *domain.User, hashPassword string) error {
	userModel := *entityBdd.CreateUserToRegister(*user, hashPassword)

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
