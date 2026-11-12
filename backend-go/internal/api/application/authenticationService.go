package application

import (
	"goTool/internal/api/domain"
	"goTool/internal/api/domain/domainMessage"
)

const (
	NOT_LOGGED     string = "Vous n'êtes pas connecté"
	NOT_AUTHORIZED string = "Accès non autorisé"
)

type AuthService struct{}

func AuthentificationService() AuthService {
	return AuthService{}
}

func (service AuthService) Verify(token string, tokenCheck domain.TokensCheck) (*domain.ConnectedUser, error) {
	if token == "" {
		err := domainMessage.TokenErrorf(NOT_LOGGED)
		err.SetTokenAbsent()
		return nil, err
	}
	// NOTE : cette vérification est faite dans la partie interface car c'est elle qui va gérer le système de contrôle des tokens. Ici, on ne fait qu'écrire la logique d'un jeton qui restitue un utilisateur et quel message restituer
	connectedUser, ok, expired := tokenCheck.Validate(token)
	if !ok {
		err := domainMessage.TokenErrorf(NOT_AUTHORIZED)
		if expired {
			err.SetTokenExpired()
		} else {
			err.SetTokenInvalid()
		}
		return nil, err
	}
	return connectedUser, nil
}
