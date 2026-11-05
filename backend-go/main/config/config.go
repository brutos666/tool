package config

import (
	"authentication/tokens"
	"database/server/connection"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/magiconair/properties"
)

var (
	props          *properties.Properties
	baseConnection baseDescription
	secretKey      []byte
)

type baseDescription struct{}

func (base baseDescription) GetDriverName() string {
	url := base.GetDataSourceName()
	urlArray := strings.Split(url, "/")
	if len(urlArray) > 3 {
		url3 := urlArray[3]
		if strings.Contains(url3, "?") {
			return strings.Split(url3, "?")[0]
		}
		return url3
	}
	panic("Base de données mal paramétrée :" + url)
}

func (base baseDescription) GetDataSourceName() string {
	url := os.Getenv("DATABASE_URL")
	if url != "" {
		return url
	}
	return props.GetString("database.datasource.url", "No_database_found")
}

func InitConfig() {
	propertiesFile := flag.String("config", "", "Nom du fichier de configuration (ex: '-config ./config.properties)'")
	flag.Parse()
	filepath := *propertiesFile
	if filepath == "" {
		// Si rien spécifié en ligne de commande, prendre le fichier dans le répertoire courant
		filepath = "./config.properties"
	}
	props = properties.MustLoadFile(filepath, properties.UTF8)
	secretKey = tokens.GenerateJWTRandomKey()
}

func IsDev() bool {
	return props.GetBool("config.dev", false)
}

func GetSchemaPath() string {
	schemaFile := flag.String("schema", "", "Nom du fichier d'initialisation de la base de données (ex: '-schema ./schema-postgresql.sql)'")
	flag.Parse()
	schemaPath := *schemaFile
	if schemaPath == "" {
		files, err := filepath.Glob("./*.sql")
		if err != nil {
			return ""
		}
		// Si rien spécifié en ligne de commande, prendre le fichier dans le répertoire courant
		schemaPath = files[0]
	}
	return schemaPath
}

func GetFrontEndPath() string {
	return props.MustGetString("http.server.frontend.path")
}

func GetServer() string {
	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		return ":8080"
	}
	return addr
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
