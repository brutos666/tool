package authentication

import (
	"authentication/tokens"

	"goTool/config"
	"goTool/domain"
)

type TokensGenerator struct {
	accessToken  string
	refreshToken string
	user         domain.User
}

func (t *TokensGenerator) SetUser(user domain.User) { t.user = user }
func (t *TokensGenerator) Generate() (accessToken string, refreshToken string) {
	connectedUser := t.user.ConvertToConnectedUSer()
	accessToken, refreshToken = tokens.Generate(connectedUser, config.GetSecretKey(), config.GetTokenDuration(), config.GetRefreshTokenDuration())
	t.accessToken = accessToken
	t.refreshToken = refreshToken
	return
}

func (t TokensGenerator) GetAccessToken() string {
	return t.accessToken
}

func (t TokensGenerator) GetRefreshToken() string {
	return t.refreshToken
}

type TokensChecker struct{}

func (t *TokensChecker) Validate(token string) (connectedUser *domain.ConnectedUser, valid bool, expired bool) {
	connectedUser, err := tokens.Validate(token, config.GetSecretKey(), &domain.ConnectedUser{})
	if err != nil {
		return nil, false, tokens.ErrorIsTokenExpired(err)
	}
	return connectedUser, true, false
}
