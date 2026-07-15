// Package authentication se charge de la gestion des jetons d'authentification dans les requêtes http afin que le serveur soit capable de savoir à quel utilisateur il s'adresse et si l'utilisateur est bien authentifié
package authentication

import (
	"authentication/tokens"
	"net/http"
	"slices"
	"strings"

	"goTool/config"
	"goTool/domain"
	"goTool/interface/http/handler/route"
)

type TokensGenerator struct {
	accessToken  string
	refreshToken string
	user         domain.User
}

func (t *TokensGenerator) SetUser(user domain.User) { t.user = user }
func (t *TokensGenerator) Generate() (accessToken string, refreshToken string) {
	connectedUser := domain.CreateConnectedUser(t.user)
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

type AuthentificationService interface {
	Verify(authHeader string, tokenCheck domain.TokensCheck) (*domain.ConnectedUser, error)
}

func InitAuthService(service AuthentificationService) { authService = service }

const (
	SEVEN_DAYS_IN_SECONDS int    = 604800
	REFRESH_TOKEN_COOKIE  string = "refreshToken"
)

var noAuthentication = []string{
	route.STOP,
	route.TEST,
	"/",
}
var authService AuthentificationService

func Authenticate(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, error) {
	requestPath := request.URL.Path
	if slices.Contains(noAuthentication, requestPath) {
		return nil, nil
	}
	authHeader := request.Header.Get("Authorization")
	token := removeBearerPrefix(authHeader)
	return authService.Verify(token, new(TokensChecker))
}

func removeBearerPrefix(value string) string {
	// Enlever le mot clé Bearer que l'on retrouve dans le header
	token, ok := strings.CutPrefix(value, "Bearer")
	if ok {
		return strings.Trim(token, " ")
	}
	return ""
}

func AuthenticateWithRefreshToken(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, error) {
	token := ""
	cookie, errNoCookie := request.Cookie(REFRESH_TOKEN_COOKIE)
	if errNoCookie == nil {
		token = cookie.Value
	}
	return authService.Verify(token, new(TokensChecker))
}

func SendRefreshTokenCookie(response http.ResponseWriter, value string) {
	cookie := http.Cookie{
		Name:     REFRESH_TOKEN_COOKIE,
		Value:    value,
		Path:     "/",
		MaxAge:   SEVEN_DAYS_IN_SECONDS,
		HttpOnly: true,
		Secure:   true, // HTTPS uniquement
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(response, &cookie)
}

func SendInvalidToken(response http.ResponseWriter, value string) {
	response.Header().Set("WWW-Authenticate", "Bearer error=\""+value+"\"")
}
