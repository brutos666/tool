package services

import (
	"os"
	"path/filepath"
	"sync"
	"time"
	"uuid"

	"github.com/wailsapp/wails/v3/pkg/application"
)

const READ_FILE_TIMEOUT = 100 * time.Second

var currentOpenedFile string

type PickedFile struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Content []byte `json:"content"`
}

var (
	pickedPaths = map[string]string{} // id -> chemin absolu
	mu          sync.Mutex
)

type FileService struct{}

func (s *FileService) Pick(accept string) (*PickedFile, error) {
	path, err := application.Get().Dialog.OpenFile().PromptForSingleSelection()
	if err != nil || path == "" {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// TODO : stocker en bdd
	id := uuid.New().String()
	mu.Lock()
	pickedPaths[id] = path
	mu.Unlock()

	return &PickedFile{ID: id, Name: filepath.Base(path), Content: data}, nil
}

func (s *FileService) SaveFile(name string, content string) (bool, error) {
	path, err := application.Get().Dialog.SaveFile().
		SetMessage("Enregistrer sous").
		SetFilename(name).
		PromptForSingleSelection()
	if err != nil || path == "" {
		return false, err
	}

	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		return false, err
	}
	return true, nil
}
