package database

import (
	"database/sql"
	"log"
	"os"
	"os/exec"
	"time"

	_ "github.com/jmrobles/h2go"
)

const h2jar = "/home/eowyn/.m2/repository/com/h2database/h2/2.4.240/h2-2.4.240.jar"
const baseDirectory = "/home/eowyn/projects/tool/backend-tool/database/"
const database = "h2://sa@localhost:9092//home/eowyn/projects/tool/backend-tool/database/task-tool-db"
//const database = "h2://sa@localhost:9092/task-tool-db"
//const database = "h2:file:/home/eowyn/projects/tool/backend-tool/database/task-tool-db"

var h2Process *exec.Cmd

func StartH2Server() error {
	h2Process = exec.Command("java",
			"-cp", h2jar,
			"org.h2.tools.Server",
			"-tcp",
			"-tcpAllowOthers",
			"-ifNotExists",
			"-trace",
	)
	// Redirige la sortie standard et d'erreur vers la console actuelle
	h2Process.Stdout = os.Stdout
	h2Process.Stderr = os.Stderr

	err := h2Process.Start()
	if err != nil {
			return err
	}

	// Laisser le temps à H2 de démarrer
	err = waitForH2()
	if err != nil {
		log.Fatalf("Can't connect to H2 Database: %s", err)
	}
	return nil
}

func StopH2Server() {
    if h2Process != nil {
        h2Process.Process.Kill()
				log.Printf("H2 Database stopped")
    }
}

func Connect() {
		// NOTE : pour pouvoir utiliser la base de données, il faut la démarrer en mode serveur TCP
		// java -jar h2-2.4.240.jar -tcp -tcpAllowOthers -tcpPort 9092
		conn, err := sql.Open("h2", database)
		if err != nil {
			log.Fatalf("Can't connect to H2 Database: %s", err)
		}
    err = conn.Ping()
    if err != nil {
        log.Fatalf("Can't ping to H2 Database: %s", err)
    }
    log.Printf("H2 Database connected")
    conn.Close()
}

func waitForH2() error {
	conn, _ := sql.Open("h2", database)
	defer conn.Close()
	
	var err error

	for i := 0; i < 10; i++ {
			if err = conn.Ping(); err == nil {
					return nil
			}
			time.Sleep(500 * time.Millisecond)
	}
	return err
}