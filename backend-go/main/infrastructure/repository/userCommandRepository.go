package repository

import (
	"context"
	"time"

	"goTool/domain"
	"goTool/infrastructure/bddService"
	"goTool/infrastructure/entityBdd"
)

const (
	SELECT_WITH_EMAIL string = "SELECT id, first_name, last_name, password, email, role FROM users WHERE email = ?"
	INSERT_USER       string = "INSERT INTO users (first_name, last_name, password, email, token, role, refresh_token, created_at, updated_at) values(:first_name, :last_name, :password, :email, :token, :role, :refresh_token, :created_at, :updated_at) RETURNING *"
	UPDATE_USER_TOKEN string = "UPDATE users SET token=?, refresh_token=?, updated_at=? where id=?"
)

type userCmdRepository struct{}

func UserCommand() domain.UserCommandRepository {
	return &userCmdRepository{}
}

// Signup implements [domain.UserCommandRepository].
func (repository *userCmdRepository) CreateUserIfNotExists(ctx context.Context, dataAccessId int, user *domain.User, hashPassword string) (alreadyExists bool, err error) {
	return doCreateUserIfNotExists(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId), user, hashPassword)
}

func (repository *userCmdRepository) GetUsersWithEmail(ctx context.Context, dataAccessId int, email string) ([]domain.User, error) {
	return getUsersWithMail(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId), email)
}

func (repository *userCmdRepository) UpdateToken(ctx context.Context, dataAccessId int, userId string, tokenGenerator domain.TokensProduct) error {
	accessToken, refreshToken := tokenGenerator.Generate()
	return doUpdateUser(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId), userId, accessToken, refreshToken)
}

func doCreateUserIfNotExists(ctx context.Context, dataBase bddService.WriteCommands, user *domain.User, hashPassword string) (alreadyExist bool, err error) {
	// Vérification si l'utilisateur existe déjà
	userModels, err := selectUsers(ctx, dataBase, user.GetEmail())
	if err != nil {
		return false, err
	}
	if len(userModels) > 0 {
		return true, nil
	}

	return false, insertUser(ctx, dataBase, user, hashPassword)
}

func doUpdateUser(ctx context.Context, dataBase bddService.WriteCommands, userId, accessToken, refreshToken string) error {
	return updateUserToken(ctx, dataBase, userId, accessToken, refreshToken)
}

func getUsersWithMail(ctx context.Context, dataBase bddService.ReadCommands, email string) ([]domain.User, error) {
	userModels, err := selectUsers(ctx, dataBase, email)
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

func selectUsers(ctx context.Context, dataBase bddService.ReadCommands, email string) ([]entityBdd.UserModel, error) {
	var existingUsers []entityBdd.UserModel
	err := dataBase.Select(ctx, SELECT_WITH_EMAIL, &existingUsers, email)
	if err != nil {
		return nil, err
	}
	return existingUsers, nil
}

func insertUser(ctx context.Context, dataBase bddService.WriteCommands, user *domain.User, hashPassword string) error {
	userModel := *entityBdd.CreateUserToRegister(*user, hashPassword)

	err := dataBase.Insert(ctx, INSERT_USER, &userModel)
	if err != nil {
		return err
	}
	user.SetId(userModel.GetId())
	return nil
}

func updateUserToken(ctx context.Context, dataBase bddService.WriteCommands, userId, accessToken, refreshToken string) error {
	_, err := dataBase.Update(ctx, UPDATE_USER_TOKEN, accessToken, refreshToken, time.Now(), userId)
	return err
}
