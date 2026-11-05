// Package httpServer s'occupe du serveur HTTP. Ce dernier attend la fin des requêtes en cours avant de s'arrêter
package httpServer

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"goTool/config"
)

type httpServer struct {
	groupServer sync.WaitGroup
	stopped     bool
	server      *http.Server
}

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
	webServer.server = &http.Server{Addr: config.GetServer(), Handler: nil}
	return webServer
}

func ServeLocalFrontEnd() {
	frontEndToServe := config.GetFrontEndPath()
	if frontEndToServe == "" {
		// Le serveur de fichier n'est pas configuré (production), il faut le démarrer via un reverse proxy (Nginx, Apache, Caddy, Traefik, etc.),
		return
	}
	frontEnd := http.FileServer(http.Dir(frontEndToServe))
	http.Handle("/", frontEnd)
}
