package mapper

import (
	"time"

	"goTool/internal/api/domain"
)

type FileWebResult struct {
	Name       string     `json:"name"`
	Platform   string     `json:"platform"`
	OpenedAt   time.Time  `json:"openedAt"`
	SavedAt    *time.Time `json:"savedAt"`
	ExportedAt *time.Time `json:"exportedAt"`
}

func ConvertFileToWebResult(file *domain.File) *FileWebResult {
	fileWebResult := new(FileWebResult)
	fileWebResult.Name = file.GetName()
	fileWebResult.Platform = file.GetPlatform()
	fileWebResult.OpenedAt = file.GetOpenedAt()
	fileWebResult.SavedAt = file.GetSavedAt()
	fileWebResult.ExportedAt = file.GetExportedAt()
	return fileWebResult
}

func ConvertFilesToWebResult(files []*domain.File) []*FileWebResult {
	spaceList := make([]*FileWebResult, len(files))
	for index := range files {
		spaceList[index] = ConvertFileToWebResult(files[index])
	}
	return spaceList
}
