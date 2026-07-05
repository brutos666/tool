// Package configuration permet de choisir la base de données
package configuration

import (
	"database/server/baseDescription"
)

// BaseConnection : La base de données configurée est postgreSql
var BaseConnection baseDescription.PgSQLBase

const (
	SCHEMA_PATH string = "./infrastructure/bdd/configuration/schema-postgresql.sql"
)
