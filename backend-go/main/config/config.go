package config

import (
	"authentication/tokens"
	"database/server/connection"
	"fmt"
	"time"

	"github.com/magiconair/properties"
)

const (
	schemaPath     string = "./config/schema-postgresql.sql"
	propertiesFile string = "./config/config.properties"
)

var (
	props          *properties.Properties
	baseConnection baseDescription
	secretKey      []byte
)

type baseDescription struct{}

func (base baseDescription) GetDriverName() string { return "postgres" }

func (base baseDescription) GetDataSourceName() string {
	return props.GetString("database.datasource.url", "No_database_found")
}

func InitConfig() {
	props = properties.MustLoadFile(propertiesFile, properties.UTF8)
	secretKey = tokens.GenerateJWTRandomKey()
}

func IsDev() bool {
	return props.GetBool("config.dev", false)
}

func GetSchemaPath() string {
	return schemaPath
}

func GetFrontEndPath() string {
	return props.MustGetString("http.server.frontend.path")
}

func GetServerUrl() string {
	if props.GetBool("http.server.secure", false) {
		return "https://" + GetServer()
	}
	return "http://" + GetServer()
}

func GetServer() string {
	host := GetServerHost()
	port := GetServerPort()
	return fmt.Sprintf("%s:%s", host, port)
}

func GetServerHost() string {
	return props.MustGetString("http.server.host")
}

func GetServerPort() string {
	return props.MustGetString("http.server.port")
}

func GetFrontServerUrl() string {
	host := props.GetString("http.server.front.host", "")
	if host == "" {
		return ""
	}
	port := props.MustGetString("http.server.front.port")
	server := fmt.Sprintf("%s:%s", host, port)
	if props.GetBool("http.server.front.secure", false) {
		return "https://" + server
	}
	return "http://" + server
}
func MustAuthenticate() bool {
	return props.GetBool("authenticate.control", true)
}

func GetTokenDuration() time.Duration {
	minuteDuration := props.MustGetInt64("authenticate.token.minutes")
	return time.Duration(minuteDuration) * time.Minute
}

func GetRefreshTokenDuration() time.Duration {
	dayDuration := props.MustGetInt64("authenticate.refresh.token.days")
	return time.Duration(dayDuration*24) * time.Hour
}

func GetBaseConnection() connection.DatabaseConnection {
	return baseConnection
}

func GetSecretKey() []byte {
	return secretKey
}
