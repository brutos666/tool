package config

import (
	"authentication/tokens"
	"database/server/connection"
	"flag"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"github.com/magiconair/properties"
)

const (
	APP_NAME      = "brutosTool"
	USER_APP_PATH = "$%{USER_APP_PATH}"
	// Permettra par exemple de remplacer la propriété de "database.path" dans "database.url=file:${database.path}/tool.db"
	// Fonctionne aussi pour les variables d'environnements
	PROPERTY_REGEX = `\${([a-zA-Z\._]*)}`
)

var (
	configProperties Properties
	baseConnection   baseDescription
	initConfig       Properties = Properties{
		ListenAddr:       ":8090",
		DatabaseURL:      "file:${database.path}/tool.db?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_time_format=sqlite",
		DatabaseDriver:   "sqlite",
		DatabaseSql:      "schema-sqlite.sql",
		TokenMinutes:     5,
		RefreshTokenDays: 7,
		MustAuthenticate: false,
		JWTSecret:        tokens.GenerateJWTRandomKey(),
	}
	// Par défaut, la sous-propriété ${database.path} est remplacée par le répertoire utilisateur
	subProperties = map[string]string{"${database.path}": "$%{USER_APP_PATH}"}
)

type baseDescription struct{}

func (base baseDescription) GetDataSourceName() string { return configProperties.DatabaseURL }
func (base baseDescription) GetDriverName() string     { return configProperties.DatabaseDriver }

func LoadDesktopConfig() {
	configProperties = loadDesktopConfig()
}

func LoadServerConfig() {
	configProps := loadFile(getPropFilePath(), initConfig)
	configProperties = loadEnv(configProps)
}

func GetProperties() Properties {
	return configProperties
}

func GetBaseConnection() connection.DatabaseConnection {
	return baseConnection
}

func loadFile(filePath string, defaultConfig Properties) Properties {
	props := properties.MustLoadFile(filePath, properties.UTF8)
	return Properties{
		ListenAddr:       readFileProperty(props, "listen.addr", defaultConfig.ListenAddr),
		DatabaseURL:      readFileProperty(props, "database.url", defaultConfig.DatabaseURL),
		DatabasePath:     readFileProperty(props, "database.path", defaultConfig.DatabasePath),
		DatabaseDriver:   readFileProperty(props, "database.driver", defaultConfig.DatabaseDriver),
		DatabaseSql:      readFileProperty(props, "database.sql", defaultConfig.DatabaseSql),
		MustAuthenticate: props.GetBool("must.authenticate", defaultConfig.MustAuthenticate),
		TokenMinutes:     props.GetInt("token.minutes", defaultConfig.TokenMinutes),
		RefreshTokenDays: props.GetInt("refresh.token.days", defaultConfig.RefreshTokenDays),
		JWTSecret:        defaultConfig.JWTSecret,
	}
}

func loadEnv(defaultConfig Properties) Properties {
	return Properties{
		ListenAddr:       readEnv("LISTEN_ADDR", defaultConfig.ListenAddr),
		DatabaseURL:      readEnv("DATABASE_URL", defaultConfig.DatabaseURL),
		DatabasePath:     readEnv("DATABASE_PATH", defaultConfig.DatabasePath),
		DatabaseDriver:   readEnv("DATABASE_DRIVER", defaultConfig.DatabaseDriver),
		DatabaseSql:      readEnv("DATABASE_SQL", defaultConfig.DatabaseSql),
		MustAuthenticate: readBoolEnv("MUST_AUTHENTICATE", defaultConfig.MustAuthenticate),
		TokenMinutes:     defaultConfig.TokenMinutes,
		RefreshTokenDays: defaultConfig.RefreshTokenDays,
		JWTSecret:        defaultConfig.JWTSecret,
	}
}

func loadDesktopConfig() Properties {
	// Aujourd'hui, il n'existe pas de propriétés intéressantes à paramétrer en mode desktop
	loadConfig := Properties{
		ListenAddr:       initConfig.ListenAddr,
		DatabaseURL:      replaceUserAppPath("file:$%{USER_APP_PATH}/tool.db?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_time_format=sqlite"),
		DatabasePath:     "",
		DatabaseDriver:   initConfig.DatabaseDriver,
		DatabaseSql:      initConfig.DatabaseSql,
		MustAuthenticate: false,
		TokenMinutes:     0,
		RefreshTokenDays: 0,
		JWTSecret:        initConfig.JWTSecret,
	}
	return loadConfig
}

func getPropFilePath() string {
	propertiesFile := flag.String("config", "", "Nom du fichier de configuration (ex: '-config ./config.properties)'")
	flag.Parse()
	filepath := *propertiesFile
	if filepath == "" {
		// Si rien spécifié en ligne de commande, prendre le fichier dans le répertoire courant
		return "./config.properties"
	}
	return filepath
}

func readBoolEnv(env string, defaultProperty bool) bool {
	property := os.Getenv(env)
	switch property {
	case "true":
		return true
	case "false":
		return false
	}
	return defaultProperty
}

func readEnv(env string, defaultProperty string) string {
	envValue := os.Getenv(env)
	if envValue == "" {
		envValue = defaultProperty
	}
	replaceName, replaceValue := readEnvSubProperty(envValue)
	if replaceName != "" {
		envValue = strings.Replace(envValue, replaceName, replaceValue, 1)
	}
	return replaceUserAppPath(envValue)
}

func envFormat(propertyName string) string {
	return strings.ReplaceAll(strings.ToUpper(propertyName), ".", "_")
}

/** Si la propriété contient une autre sous propriété, elle est remplacée par la valeur de la sous propriété */
func readFileProperty(props *properties.Properties, propertyName string, defaultProperty string) string {
	propertyValue := props.GetString(propertyName, defaultProperty)
	readFileSubProperty(props, propertyValue)
	return propertyValue
}

func readProperty(property string, defaultProperty string) string {
	if property == "" {
		return defaultProperty
	}
	return property
}

func readIntProperty(property int, defaultProperty int) int {
	if property == 0 {
		return defaultProperty
	}
	return property
}

func readEnvSubProperty(property string) (replaceName, replaceValue string) {
	subPropertyName, replaceName := getSubProperty(property)
	if replaceName == "" {
		return "", ""
	}
	subPropertyValue := os.Getenv(envFormat(subPropertyName))
	if subPropertyValue == "" {
		return replaceName, subProperties[replaceName]
	}
	return replaceName, subPropertyValue
}

func readFileSubProperty(props *properties.Properties, property string) {
	subPropertyName, replaceName := getSubProperty(property)
	if replaceName == "" {
		return
	}
	defaultProperty, ok := subProperties[replaceName]
	if ok {
		subProperties[replaceName] = props.GetString(subPropertyName, defaultProperty)
	} else {
		subProperties[replaceName] = props.GetString(subPropertyName, "")
	}
}

// Recherche si la chaîne contient ${myProp} afin de pouvoir remplacer ${myProp} par la valeur de la propriété myProp
// Retourne propertyName: nom de la propriété (myProp), replaceName: chaîne à remplacer (${myProp})
func getSubProperty(value string) (propertyName string, replaceName string) {
	regExpr := regexp.MustCompile(PROPERTY_REGEX)
	arrResult := regExpr.FindStringSubmatch(value)
	if len(arrResult) < 1 {
		return "", ""
	}
	propertyName = arrResult[1]
	replaceName = arrResult[0]
	return propertyName, replaceName
}

func replaceUserAppPath(path string) string {
	if strings.Contains(path, USER_APP_PATH) {
		return strings.Replace(path, USER_APP_PATH, appUserPath(APP_NAME), 1)
	}
	return path
}

func appUserPath(app string) string {
	var err error
	var home string
	switch runtime.GOOS {
	case "windows":
		home = os.Getenv("LOCALAPPDATA")
		if home == "" {
			home, err = os.UserConfigDir() // repli
		}
	case "darwin":
		home, err = os.UserHomeDir()
		home = filepath.Join(home, "Library", "Application Support")
	default: // linux et autres
		home = os.Getenv("XDG_DATA_HOME")
		if home == "" || filepath.IsAbs(home) {
			home, err = os.UserHomeDir()
			home = filepath.Join(home, ".local", "share")
		}
	}
	if err != nil {
		// On ne peut pas démarré l'appli si on ne peut pas stocker des données sur le poste utilisateur
		panic("Home ne semple pas défini sur cette machine (" + err.Error() + ")")
	}
	// Créer le répertoire s'il n'existe pas encore
	directory := filepath.Join(home, app)
	if filepath.IsAbs(directory) {
		err = os.MkdirAll(directory, 0o700)
		if err != nil {
			// On ne peut pas démarré l'appli si on ne peut pas stocker des données sur le poste utilisateur
			panic("Impossible de créer le répertoire '" + directory + "' (" + err.Error() + ")")
		}
	}
	return directory
}
