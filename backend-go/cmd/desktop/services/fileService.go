package services

import (
	"os"
	"sync"
	"time"
	"uuid"

	"github.com/wailsapp/wails/v3/pkg/application"
)

const READ_FILE_TIMEOUT = 100 * time.Second

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

	return &PickedFile{ID: id, Name: path, Content: data}, nil
}

func (s *FileService) SaveAs(name string, content string) (string, error) {
	path, err := application.Get().Dialog.SaveFile().
		SetMessage("Enregistrer sous").
		SetFilename(name).
		PromptForSingleSelection()
	if err != nil || path == "" {
		return path, err
	}
	return path, s.Save(path, content)
}

func (s *FileService) Save(path string, content string) error {
	return os.WriteFile(path, []byte(content), 0o644)
}
