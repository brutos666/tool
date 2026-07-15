package application

import (
	"authentication/password"
	"context"

	"goTool/domain"
	"goTool/domain/domainMessage"
)

const (
	USER_CREATED             string = "Le compte de l'utilisateur a été créé avec succès"
	USER_CONNECTED           string = "L'utilisateur %v est connecté"
	WRONG_PASSWORD           string = "Mot de passe incorrect"
	EMAIL_NOT_UNIQUE         string = "Plusieurs utilisateurs possèdent le même email : veuillez contacter l'administrateur"
	EMAIL_NOT_EXISTS         string = "Il n'existe pas de compte utilisateur pour cet email"
	EMAIL_NOT_EXISTS_ANYMORE string = "Il n'existe plus de compte utilisateur pour cet email"
)

type (
	UserCmdService struct {
		repository domain.UserCommandRepository
	}
)

func UserCommandService(repository domain.UserCommandRepository) UserCmdService {
	return UserCmdService{repository: repository}
}

// Signup doit créer le compte et connecter l'utilisateur
// Le service met à jour les jetons d'authentification dans les données (infrastructure)
// Les jetons sont générés par l'interface via TokenGenerator : il faut lui fournir l'utilisateur créé
func (commandService UserCmdService) Signup(ctx context.Context, dataAccess domain.DataAccess, tokenGenerator domain.TokensProduct, user *domain.User) (*domain.LoggedUser, error) {
	password := password.Hash(user.GetPassword())

	alreadyExists, err := commandService.repository.CreateUserIfNotExists(ctx, dataAccess, user, password)
	if err != nil {
		return nil, err
	}
	if alreadyExists {
		error := domainMessage.Errorf("L'utilisateur avec l'email %s existe déjà", user.GetEmail())
		error.AddContext("email", user.GetEmail())
		return nil, error
	}

	tokenGenerator.SetUser(*user)
	err = commandService.repository.UpdateToken(ctx, dataAccess, user.GetId(), tokenGenerator)
	if err != nil {
		return nil, err
	}
	return domain.CreateLoggedUser(*user), nil
}

// Login doit connecté l'utilisateur en vérifiant si son mot de passe est valide
// Le service doit vérifier si le mot de passe correspond à celui conservé dans les données (infrastructure)
// Il met à jour les jetons d'authentification dans les données (infrastructure)
// Les jetons sont générés par l'interface via TokenGenerator : il faut lui fournir l'utilisateur connecté
func (commandService UserCmdService) Login(ctx context.Context, dataAccess domain.DataAccess, tokenGenerator domain.TokensProduct, logUser *domain.LoginUser) (*domain.LoggedUser, error) {
	users, err := commandService.repository.GetUsersWithEmail(ctx, dataAccess, logUser.GetEmail())
	if err != nil {
		return nil, err
	}
	nbUser := len(users)
	if nbUser == 0 {
		err := domainMessage.NewError(EMAIL_NOT_EXISTS)
		err.AddContext("email", logUser.GetEmail())
		return nil, err
	}
	if nbUser > 1 {
		err := domainMessage.NewError(EMAIL_NOT_UNIQUE)
		err.AddContext("email", logUser.GetEmail())
		return nil, err
	}
	user := users[0]
	ok := password.Verify(user.GetPassword(), logUser.GetPassword())
	if !ok {
		err := domainMessage.NewError(WRONG_PASSWORD)
		err.AddContext("email", logUser.GetEmail())
		return nil, err
	}
	tokenGenerator.SetUser(user)
	err = commandService.repository.UpdateToken(ctx, dataAccess, user.GetId(), tokenGenerator)
	if err != nil {
		return nil, err
	}
	return domain.CreateLoggedUser(user), nil
}

// Refresh doit reconnecté l'utilisateur sans lui redemander son mot de passe
// (jeton expiré ou perdu suite à un rechargement de la page, une redirection)
// L'interface fournit un utilisateur connecté déduit par son système d'authentification.
// Le service va juste vérifier si le compte utilisateur fourni existe toujours.
// Il met à jour les jetons d'authentification dans les données (infrastructure)
// Les jetons sont générés par l'interface via TokenGenerator : il faut donc lui fournir l'utilisateur
func (commandService UserCmdService) Refresh(ctx context.Context, dataAccess domain.DataAccess, tokenGenerator domain.TokensProduct, connectedUser domain.ConnectedUser) (*domain.LoggedUser, error) {
	email := connectedUser.GetEmail()
	// On vérifie si le compte utilisateur existe toujours
	users, err := commandService.repository.GetUsersWithEmail(ctx, dataAccess, email)
	if err != nil {
		return nil, err
	}
	if len(users) == 0 {
		err := domainMessage.NewError(EMAIL_NOT_EXISTS_ANYMORE)
		err.AddContext("email", email)
		return nil, err
	}
	user := users[0]
	// Si l'utilisateur retrouvé par l'interface est valide, il faut rafraîchir ses jetons
	tokenGenerator.SetUser(user)
	err = commandService.repository.UpdateToken(ctx, dataAccess, user.GetId(), tokenGenerator)
	if err != nil {
		return nil, err
	}

	loggedUser := domain.CreateLoggedUser(users[0])
	return loggedUser, nil
}
