package config

import (
	"time"
)

type Properties struct {
	ListenAddr       string
	DatabaseURL      string
	DatabasePath     string // Chemin où doit se trouver la base de données (pour sqlite)
	DatabaseDriver   string
	DatabaseSql      string
	MustAuthenticate bool
	TokenMinutes     int    // Durée du jeton d'authentification en minutes
	RefreshTokenDays int    // Durée du jeton de rechargement de la session en jour
	JWTSecret        []byte // Le secret devrait être fourni par un outil externe
}

func (p Properties) GetSchemaPath() string    { return p.DatabaseSql }
func (p Properties) GetServer() string        { return p.ListenAddr }
func (p Properties) IsMustAuthenticate() bool { return p.MustAuthenticate }
func (p Properties) GetTokenDuration() time.Duration {
	minuteDuration := p.TokenMinutes
	return time.Duration(minuteDuration) * time.Minute
}

func (p Properties) GetRefreshTokenDuration() time.Duration {
	dayDuration := p.RefreshTokenDays
	return time.Duration(dayDuration*24) * time.Hour
}
func (p Properties) GetSecretKey() []byte { return p.JWTSecret }
