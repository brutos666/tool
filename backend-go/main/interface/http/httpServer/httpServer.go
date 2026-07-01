// Package httpServer s'occupe du serveur HTTP. Ce dernier attend la fin des requêtes en cours avant de s'arrêter
package httpServer

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

type httpServer struct {
	groupServer sync.WaitGroup
	stopped     bool
	server      *http.Server
}

var webServer httpServer

func (webServer *httpServer) start() {
	defer webServer.alertServerIsEnd()
	err := webServer.server.ListenAndServe()
	if err != nil {
		log.Printf("Arrêt du serveur ou erreur lors du démarrage du serveur : %s", err)
	}
}

func (webServer *httpServer) stop() {
	defer webServer.alertServerIsEnd()
	log.Println("Attente fin des requêtes en cours")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := webServer.server.Shutdown(ctx); err != nil {
		log.Fatalf("Arrêt forcé : %s", err)
	}
}

func (webServer *httpServer) setStop() {
	webServer.stopped = true
}

func (webServer *httpServer) isStop() bool {
	return webServer.stopped
}

func (webServer *httpServer) mustWaitEndOfServer() {
	webServer.groupServer.Add(1)
}

func (webServer *httpServer) alertServerIsEnd() {
	webServer.groupServer.Done()
}

func (webServer *httpServer) waitEndOfServer() {
	webServer.groupServer.Wait()
}

func createServer() *httpServer {
	webServer := new(httpServer)
	webServer.stopped = false
	webServer.server = &http.Server{Addr: ":8080", Handler: nil}
	return webServer
}

func ServerStart() {
	webServer = *createServer()
	webServer.mustWaitEndOfServer()
	go webServer.start()
}

func ServerWait() {
	// Attend l'arrêt du serveur
	webServer.waitEndOfServer()
}

func ServerStop() {
	webServer.setStop()
	webServer.mustWaitEndOfServer()
	go webServer.stop()
}

func ServerIsStop() bool {
	return webServer.isStop()
}

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
	ServerStop()
}
