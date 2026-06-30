package repository

import (
	"database/server/baseDescription"
)

var BaseConnection baseDescription.PgSQLBase

const (
	SCHEMA_PATH = "../resources/schema-postgresql.sql"
)
