package httpServer

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

type HttpSrvService struct {
	webServer httpServer
}

func HttpServerService() HttpSrvService { return HttpSrvService{} }

func (s *HttpSrvService) ServerStart() {
	s.webServer = *createServer()
	s.webServer.mustWaitEndOfServer()
	go s.webServer.start()
}

func (s *HttpSrvService) ServerWait() {
	// Attend l'arrêt du serveur
	s.webServer.waitEndOfServer()
}

func (s *HttpSrvService) ServerStop() {
	s.webServer.setStop()
	s.webServer.mustWaitEndOfServer()
	go s.webServer.stop()
}

func (s *HttpSrvService) ServerIsStop() bool {
	return s.webServer.isStop()
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
	log.Printf("Réception du signal d'interruption '%v'", sig)
	s.ServerStop()
}
