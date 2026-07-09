package tokens

import (
	"errors"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	TOKEN_DURATION         time.Duration = 24 * time.Hour
	REFRESH_TOKEN_DURATION time.Duration = 7 * 24 * time.Hour
	CLAIMS_STRUCT_KO       string        = "la structure permettant de restituer les informations sur l'utilisateur connecté est incorrecte"
)

type (
	UserInfos interface{}
	Claims    struct {
		userInfos UserInfos
		/*
			UserID string `json:"user_id"`
			Email  string `json:"email"`
			Role   string `json:"role"`
		*/

		jwt.RegisteredClaims
	}
)

var jwtKey []byte

func SetJWTKey(key string) {
	jwtKey = []byte(key)
}

func GetJWTKey() []byte {
	return []byte(jwtKey)
}

// Generate : à partir des informations sur l'utilisateur, on va générer 2 jetons d'authentification, un avec une durée de validité courte, et un autre avec une durée de validation plus longue
func Generate(userInfos UserInfos) (string, string) {
	log.Printf("JWT Key %v Type: %T", jwtKey, jwtKey)

	claims := &Claims{
		userInfos: userInfos,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(TOKEN_DURATION)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "Server",
		},
	}

	refreshClaims := &Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(REFRESH_TOKEN_DURATION)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "Server",
		},
	}

	// Génération des jetons
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedAccessToken, err := accessToken.SignedString(jwtKey)
	if err != nil {
		panic(err)
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(jwtKey)
	if err != nil {
		panic(err)
	}

	return signedAccessToken, signedRefreshToken
}

// Validate : valide que le jeton est correct et restitue Claims permettant de retrouver l'utilisateur concerné ainsi que ses droits (role). Retourne une erreur de type jwt si le jeton est expiré : Tester "errors.Is(err, jwt.ErrTokenExpired)"
func Validate[U UserInfos](tokenString string) (*U, error) {
	var userInfos U
	secretKey := GetJWTKey()

	claims := new(Claims)
	claims.userInfos = new(U)

	accessToken, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		return secretKey, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := accessToken.Claims.(*Claims)
	userInfos = claims.userInfos.(U)
	if accessToken.Valid && ok {
		return &userInfos, nil
	}
	return nil, errors.New(CLAIMS_STRUCT_KO)
}

func ErrorIsTokenExpired(err error) bool {
	return errors.Is(err, jwt.ErrTokenExpired)
}
