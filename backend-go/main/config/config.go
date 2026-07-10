package config

import (
	"database/server/connection"

	"github.com/magiconair/properties"
)

const (
	schemaPath     string = "./config/schema-postgresql.sql"
	propertiesFile string = "./config/config.properties"
)

var (
	props          *properties.Properties
	baseConnection baseDescription
	dataSourceName string
)

type baseDescription struct{}

func (base baseDescription) GetDriverName() string { return "postgres" }

func (base baseDescription) GetDataSourceName() string {
	return props.GetString("database.datasource.url", "No_database_found")
}

func init() {
	props = properties.MustLoadFile(propertiesFile, properties.UTF8)
}

func GetSchemaPath() string {
	return schemaPath
}

func GetServer() string {
	return props.GetString("http.server.url", "http://localhost:8080")
}

func GetBaseConnection() connection.DatabaseConnection {
	return baseConnection
}
