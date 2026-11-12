package main

import (
	"embed"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"goTool/cmd/desktop/services"
	"goTool/internal/api"
	"goTool/internal/api/interface/handler"

	_ "modernc.org/sqlite"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed frontend/dist/frontend-angular/browser
var assets embed.FS

func main() {
	app := application.New(application.Options{
		Name:        "BrutosTool",
		Description: "Outils de suivi des choses à faire",
		Assets: application.AssetOptions{
			Handler: router(),
		},
		Services: []application.Service{
			application.NewService(&services.LogService{}),
		},
	})

	handler.InitServerService(&services.HttpSrvService{})

	api.StartDesktop()

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:      "Mes tâches",
		StartState: application.WindowStateMaximised,
	})
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

func router() *http.ServeMux {
	apiHandler := api.Serve()
	apiHandler.Handle("/", application.AssetFileServerFS(assets))
	/*
		mux := http.NewServeMux()
		mux.Handle("/api/", api.Serve())
		mux.Handle("/", application.AssetFileServerFS(assets))
	*/
	return apiHandler
}

func getDsnUrl() (string, error) {
	dir, err := os.UserConfigDir() // %AppData% sous Windows
	if err != nil {
		return "", err
	}
	dir = filepath.Join(dir, "Tool")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	dsn := "file:" + filepath.ToSlash(filepath.Join(dir, "tool.db")) +
		"?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_time_format=sqlite"
	return dsn, nil
}
