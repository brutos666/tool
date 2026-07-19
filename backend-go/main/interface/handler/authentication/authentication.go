// Package authentication se charge de la gestion des jetons d'authentification dans les requêtes http afin que le serveur soit capable de savoir à quel utilisateur il s'adresse et si l'utilisateur est bien authentifié
package authentication

import (
	"net/http"
	"slices"
	"strings"

	"goTool/domain"
	"goTool/interface/handler/route"
)

const (
	SEVEN_DAYS_IN_SECONDS int    = 604800
	REFRESH_TOKEN_COOKIE  string = "refreshToken"
	AUTH_HEADER                  = "Authorization"
	AUTH_TOKEN_PREFIX            = "Bearer "
)

type AuthentificationService interface {
	Verify(authHeader string, tokenCheck domain.TokensCheck) (*domain.ConnectedUser, error)
}

var authService AuthentificationService

func InitAuthService(service AuthentificationService) { authService = service }

var noAuthentication = []string{
	route.STOP,
	route.TEST,
	"/",
}

func Authenticate(request *http.Request) (*domain.ConnectedUser, error) {
	requestPath := request.URL.Path
	if slices.Contains(noAuthentication, requestPath) {
		return nil, nil
	}
	authHeader := request.Header.Get(AUTH_HEADER)
	token := removeBearerPrefix(authHeader)
	return authService.Verify(token, new(TokensChecker))
}

func removeBearerPrefix(value string) string {
	// Enlever le mot clé Bearer que l'on retrouve dans le header
	token, ok := strings.CutPrefix(value, AUTH_TOKEN_PREFIX)
	if ok {
		return strings.Trim(token, " ")
	}
	return ""
}

func AuthenticateWithRefreshToken(request *http.Request) (*domain.ConnectedUser, error) {
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
	response.Header().Set("WWW-Authenticate", AUTH_TOKEN_PREFIX+"error=\""+value+"\"")
}
