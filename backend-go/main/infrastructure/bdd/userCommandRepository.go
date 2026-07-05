package bdd

import (
	"context"
	"database/server/connection"
	"database/server/requestSQL"

	"goTool/domain"
	"goTool/errorHelper/specificError"
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
}

// Signup implements [domain.UserCommandRepository].
func (repository *userCmdRepository) Signup(ctx context.Context, user *domain.User, hashPassword string, accessToken string, refreshToken string) error {
	return connection.LaunchTransactionnel(ctx, configuration.BaseConnection, doSignUp, userInfosArgs{user, hashPassword, accessToken, refreshToken})
}

func doSignUp(connection connection.Connection, userInfos userInfosArgs) error {
	// Vérification si l'utilisateur existe déjà
	var existingUsers []entityBdd.UserModel
	err := requestSQL.Select(connection, &existingUsers, SELECT_WITH_EMAIL, userInfos.user.GetEmail())
	if err != nil {
		return err
	}
	if len(existingUsers) > 0 {
		functionalErr := specificError.Errorf("L'utilisateur avec l'email %s existe déjà", userInfos.user.GetEmail())
		functionalErr.AddContext("email", userInfos.user.GetEmail())
		return functionalErr
	}

	userModel := *entityBdd.CreateUserToRegister(*userInfos.user, userInfos.hashPassword, userInfos.accessToken, userInfos.refreshToken)

	err = requestSQL.ExecWithReturn(connection, userModel, &userModel, INSERT_USER)
	if err != nil {
		return err
	}
	userInfos.user.SetId(userModel.GetId())
	return nil
}
