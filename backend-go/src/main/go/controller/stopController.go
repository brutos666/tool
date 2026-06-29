package controller

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"goTool/handler"
)

func StopServerOnSignal() {
	// Create a channel to receive signals
	sigChan := make(chan os.Signal, 1)

	// Notify the channel for specific signals
	signal.Notify(sigChan,
		syscall.SIGINT,  // Ctrl+C
		syscall.SIGTERM, // Termination signal
	)

	// Wait for signal
	sig := <-sigChan
	log.Printf("Réception du signal d'interruption '%v'", sig)
	handler.ServerStop()
}
