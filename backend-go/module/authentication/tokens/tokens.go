package tokens

import (
	"crypto/rand"
	"errors"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	CLAIMS_STRUCT_KO string = "la structure permettant de restituer les informations sur l'utilisateur connecté est incorrecte"
)

type (
	UserInfos interface {
		GetId() string
		GetEmail() string
		GetRole() string
		SetId(string)
		SetEmail(string)
		SetRole(string)
	}

	Claims struct {
		UserID string
		Email  string
		Role   string
		jwt.RegisteredClaims
	}
)

func GenerateJWTRandomKey() []byte {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		log.Fatal("Failed to generate key", err)
	}
	return bytes
}

// Generate : à partir des informations sur l'utilisateur, on va générer 2 jetons d'authentification, un avec une durée de validité courte, et un autre avec une durée de validation plus longue
func Generate(userInfos UserInfos, secretKey []byte, tokenExpiry time.Duration, refreshTokenExpiry time.Duration) (string, string) {
	log.Printf("JWT Key %v Type: %T", secretKey, secretKey)

	claims := &Claims{
		UserID: userInfos.GetId(),
		Email:  userInfos.GetEmail(),
		Role:   userInfos.GetRole(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(tokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "Server",
		},
	}

	refreshClaims := &Claims{
		UserID: userInfos.GetId(),
		Email:  userInfos.GetEmail(),
		Role:   userInfos.GetRole(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "Server",
		},
	}

	// Génération des jetons
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedAccessToken, err := accessToken.SignedString(secretKey)
	if err != nil {
		panic(err)
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(secretKey)
	if err != nil {
		panic(err)
	}
	return signedAccessToken, signedRefreshToken
}

// Validate : valide que le jeton est correct et restitue Claims permettant de retrouver l'utilisateur concerné ainsi que ses droits (role). Retourne une erreur de type jwt si le jeton est expiré (bien Tester "errors.Is(err, jwt.ErrTokenExpired)".
func Validate[U UserInfos](tokenString string, secretKey []byte, user U) (U, error) {
	claims := new(Claims)

	accessToken, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		return secretKey, nil
	})
	if err != nil {
		return user, err
	}
	claims, ok := accessToken.Claims.(*Claims)

	if accessToken.Valid && ok {
		user.SetId(claims.UserID)
		user.SetEmail(claims.Email)
		user.SetRole(claims.Role)
		return user, nil
	}
	return user, errors.New(CLAIMS_STRUCT_KO)
}

func ErrorIsTokenExpired(err error) bool {
	return errors.Is(err, jwt.ErrTokenExpired)
}
