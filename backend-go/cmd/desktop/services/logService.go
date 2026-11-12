package services

import (
	"context"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type LogService struct {
	app *application.App
}

func (s *LogService) ServiceName() string {
	return "Login Service"
}

func (s *LogService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.app = application.Get()
	s.app.Logger.Info("Application démarrée")
	return nil
}

func (s *LogService) ServiceShutdown() error {
	s.app.Logger.Info("Application arrêtée")
	return nil
}
