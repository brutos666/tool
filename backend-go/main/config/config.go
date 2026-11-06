package config

import (
	"authentication/tokens"
	"database/server/connection"
	"flag"
	"fmt"
	"os"
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
	driver := os.Getenv("DATABASE_DRIVER")
	if driver != "" {
		return driver
	}
	driver = props.GetString("database.datasource.driver", "")
	if driver == "" {
		panic("Le driver de la base de données n'est pas fourni (sqlite, postgres, ...) env=DATABASE_DRIVER ou database.datasource.driver dans config.properties")
	}
	return driver
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
		filepath = "../config.properties"
	}
	props = properties.MustLoadFile(filepath, properties.UTF8)
	secretKey = tokens.GenerateJWTRandomKey()
}

func IsDev() bool {
	return props.GetBool("config.dev", false)
}

func GetSchemaPath() string {
	driver := os.Getenv("DATABASE_SQL")
	if driver != "" {
		return driver
	}
	driver = props.GetString("database.datasource.sql", "")
	if driver == "" {
		panic("Le fichier d'initialisation des tables de la base de données n'est pas fourni (xxx.sql) env=DATABASE_SQL ou database.datasource.driver dans config.properties")
	}
	return driver
}

func GetFrontEndPath() string {
	return props.MustGetString("http.server.frontend.path")
}

func GetServer() string {
	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		return ":8090"
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
