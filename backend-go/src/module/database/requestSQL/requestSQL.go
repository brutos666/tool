package requestSQL

import (
	"database/server/connection"
)


func Select(base connection.DatabaseConnection, dest interface{}, query string) (error) {
	connection := connection.OpenConnection(base)
	defer connection.Close()
	return connection.Select(dest, query)
}