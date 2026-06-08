package server

import (
	"database/server/connection"
	"log"
	"os"
	"os/exec"
	"strings"
)

const driverJar = "/home/eowyn/.m2/repository/com/h2database/h2/2.4.240/h2-2.4.240.jar"
const driverJarOption = "org.h2.tools.Server"

var baseProcess *exec.Cmd

func StartServer(baseConnection connection.DatabaseConnection) error {
	baseProcess = exec.Command("java",
			"-cp", driverJar,
			driverJarOption,
			"-tcp",
			"-tcpAllowOthers",
			"-ifNotExists",
			"-trace",
	)
	// Redirige la sortie standard et d'erreur vers la console actuelle
	baseProcess.Stdout = os.Stdout
	baseProcess.Stderr = os.Stderr

	err := baseProcess.Start()
	if err != nil {
			return err
	}

	databaseName := baseConnection.GetDriverName()
	// Laisser le temps à la base de démarrer
	log.Printf("Base %s : attente", strings.ToUpper(databaseName))
	err = connection.WaitForProcess(baseConnection)
	if err != nil {
		log.Fatalf("Base %s impossible à démarrer : %s", strings.ToUpper(databaseName), err)
	}
	log.Printf("Base %s : démarrée", strings.ToUpper(databaseName))
	return nil
}

func StopServer(baseConnection connection.DatabaseConnection) {
	if baseProcess != nil {
		baseProcess.Process.Kill()
		baseProcess.Wait()
		databaseName := baseConnection.GetDriverName()
		log.Printf("Base %s : arrêtée", strings.ToUpper(databaseName))
	}
}
