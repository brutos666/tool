package connection

import (
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type DatabaseConnection interface {
	GetDriverName() string
	GetDataSourceName() string
}

func OpenConnection(base DatabaseConnection)  (*sqlx.DB){
	driverName := base.GetDriverName()
	db, err := sqlx.Open(driverName, base.GetDataSourceName())
		if err != nil {
		log.Fatalf("Base %s : impossible de se connecter (%s)", driverName, err)
	}
	err = db.Ping()
	if err != nil {
			log.Fatalf("Base %s : impossible de ping (%s)", driverName, err)
	}
	log.Printf("Base %s : connectée", driverName)
	return db
}

func WaitForProcess(base DatabaseConnection) error {
	conn := OpenConnection(base)
	defer conn.Close()
	
	var err error

	for range 10 {
			if err = conn.Ping(); err == nil {
				return nil
			}
			time.Sleep(500 * time.Millisecond)
	}
	return err
}
