package services

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type HttpSrvService struct {
	app     *application.App
	running bool
}

func (s *HttpSrvService) ServerStart() {
	s.app = application.Get()
	s.app.Logger.Info("Serveur démarré")
	s.running = true
}

func (s *HttpSrvService) StopServerOnSignal() {
	// Create a channel to receive signals
	sigChan := make(chan os.Signal, 1)

	// Notify the channel for specific signals
	signal.Notify(
		sigChan,
		syscall.SIGINT,  // Ctrl+C
		syscall.SIGTERM, // Termination signal
	)

	// Wait for signal
	sig := <-sigChan
	s.app.Logger.Info("Réception du signal d'interruption", "signal", sig)
	s.ServerStop()
}

func (s *HttpSrvService) ServerStop() {
	// Arrêt forcé
	s.running = false
	s.app.Logger.Info("Un arrêt a été demandé")
	s.app.Quit()
}

func (s *HttpSrvService) ServerIsStop() bool {
	return !s.running
}
