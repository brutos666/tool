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
	"goTool/interface/http/httpMessage"
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

const (
	SEVEN_DAYS_IN_SECONDS int    = 604800
	REFRESH_TOKEN_COOKIE  string = "refreshToken"
	NOT_LOGGED            string = "Vous n'êtes pas connecté"
	NOT_AUTHORIZED        string = "Accès non autorisé"
)

var noAuthentication = []string{
	route.STOP,
	route.TEST,
	"/",
}

func Authenticate(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, *httpMessage.Message) {
	requestPath := request.URL.Path
	if slices.Contains(noAuthentication, requestPath) {
		return nil, nil
	}

	authHeader := request.Header.Get("Authorization")
	if authHeader == "" {
		sendErrorTokenHeader(response, "no_token")
		return nil, httpMessage.NewError(NOT_LOGGED, requestPath, http.StatusUnauthorized)
	}
	// Enlever le mot clé Bearer que l'on retrouve dans le header
	auth, ok := strings.CutPrefix(authHeader, "Bearer")
	if !ok {
		sendErrorTokenHeader(response, "invalid_token")
		return nil, httpMessage.NewError(NOT_AUTHORIZED, requestPath, http.StatusUnauthorized)
	}
	auth = strings.Trim(auth, " ")
	return validateAuth(auth, requestPath, response)
}

func AuthenticateWithRefreshToken(response http.ResponseWriter, request *http.Request) (*domain.ConnectedUser, *httpMessage.Message) {
	requestPath := request.URL.Path
	cookie, err := request.Cookie(REFRESH_TOKEN_COOKIE)
	if err != nil {
		sendErrorTokenHeader(response, "no_token")
		return nil, httpMessage.NewError(NOT_AUTHORIZED, requestPath, http.StatusUnauthorized)
	}
	return validateAuth(cookie.Value, requestPath, response)
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

func validateAuth(auth, requestPath string, response http.ResponseWriter) (*domain.ConnectedUser, *httpMessage.Message) {
	connectedUser, err := tokens.Validate(auth, config.GetSecretKey(), &domain.ConnectedUser{})
	if err != nil {
		if tokens.ErrorIsTokenExpired(err) {
			sendErrorTokenHeader(response, "token_expired")
		} else {
			sendErrorTokenHeader(response, "invalid_token")
		}
		return nil, httpMessage.NewError(err.Error(), requestPath, http.StatusUnauthorized)
	}
	return connectedUser, nil
}

func sendErrorTokenHeader(response http.ResponseWriter, value string) {
	response.Header().Set("WWW-Authenticate", "Bearer error=\""+value+"\"")
}
