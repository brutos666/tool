package main

import (
	"time"

	"goTool/internal/api"

	// Base de données supportées
	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

const BDD_INIT_TIMEOUT = 10 * time.Second

func main() {
	api.StartAndServe()
}
