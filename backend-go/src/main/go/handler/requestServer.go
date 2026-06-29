package handler

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"
)

type requestServer struct {
	groupServer sync.WaitGroup
	stopped     bool
	server      *http.Server
}

var webServer requestServer

func (webServer *requestServer) start() {
	defer webServer.alertServerIsEnd()
	err := webServer.server.ListenAndServe()
	if err != nil {
		log.Printf("Arrêt du serveur ou erreur lors du démarrage du serveur : %s", err)
	}
}

func (webServer *requestServer) stop() {
	defer webServer.alertServerIsEnd()
	log.Println("Attente fin des requêtes en cours")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := webServer.server.Shutdown(ctx); err != nil {
		log.Fatalf("Arrêt forcé : %s", err)
	}
}

func (webServer *requestServer) setStop() {
	webServer.stopped = true
}

func (webServer *requestServer) isStop() bool {
	return webServer.stopped
}

func (webServer *requestServer) mustWaitEndOfServer() {
	webServer.groupServer.Add(1)
}

func (webServer *requestServer) alertServerIsEnd() {
	webServer.groupServer.Done()
}

func (webServer *requestServer) waitEndOfServer() {
	webServer.groupServer.Wait()
}

func createServer() *requestServer {
	webServer := new(requestServer)
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
