package handler

import (
	"net/http"
	"sync"
)

type requestServer struct {
	group sync.WaitGroup
	groupServer sync.WaitGroup
	stopped bool
	server *http.Server
}
func (webServer *requestServer) start() {
	defer webServer.alertServerIsEnd()
	webServer.server.ListenAndServe()
}
func (webServer *requestServer) stop() {
	webServer.waitEndOfGoRoutines()
	webServer.server.Close()
}
func (webServer *requestServer) setStop() {
	webServer.stopped = true
}
func (webServer *requestServer) isStop() bool {
	return webServer.stopped
}
func (webServer *requestServer) addGoRoutineToWait() {
	webServer.group.Add(1)
}
func (webServer *requestServer) alertGoRoutineIsDone() {
	webServer.group.Done()
}
func (webServer *requestServer) waitEndOfGoRoutines() {
	webServer.group.Wait()
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