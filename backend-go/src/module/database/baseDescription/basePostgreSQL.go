package baseDescription

import (
	_ "github.com/lib/pq"
)

type PgSQLBase struct {
}

func (base PgSQLBase) GetDriverName() string {
	return "postgres"
}
func (base PgSQLBase) GetDataSourceName() string {
	return "host=localhost user=postgres password=postgres dbname=postgres port=5432 sslmode=disable"
}
