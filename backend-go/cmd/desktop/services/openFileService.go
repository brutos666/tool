package services

import (
	"context"
	"io"
	"os"
	"time"

	"goTool/internal/api/interface/handler"

	"github.com/wailsapp/wails/v3/pkg/application"
)

const READ_FILE_TIMEOUT = 100 * time.Second

type DesktopFile struct {
	io.Reader
	name string
}

func (f DesktopFile) FileName() string { return f.name }

type OpenFileService struct {
	app   *application.App
	Calls map[string]handler.WailsFileCall
}

func (s *OpenFileService) ChooseFileToDo(action string) (any, error) {
	ctx, cancel := context.WithTimeout(context.Background(), READ_FILE_TIMEOUT)
	defer cancel()

	path, err := s.app.Dialog.OpenFile().
		AddFilter("TXT", "*.txt").
		AddFilter("CSV", "*.csv").
		PromptForSingleSelection()
	if err != nil || path == "" {
		return 0, err // annulé
	}
	f, err := os.Open(path)
	if err != nil {
		return 0, err
	}
	defer f.Close()
	fileReader := DesktopFile{Reader: f, name: f.Name()}

	call := s.Calls[action]
	return call(ctx, handler.CallContext{}, fileReader)
}
