package mapper

import (
	"goTool/internal/api/domain"
)

type FileWebResult struct {
	Name     string `json:"name"`
	Platform string `json:"platform"`
	OpenedAt string `json:"openedAt"`
	SavedAt  string `json:"savedAt"`
}

func (file FileWebResult) ConvertToDomain() *domain.File {
	fileParam := new(domain.File)
	fileParam.SetName(file.Name)
	fileParam.SetPlatform(file.Platform)
	return fileParam
}

func ConvertFileToWebResult(file *domain.File) *FileWebResult {
	fileWebResult := new(FileWebResult)
	fileWebResult.Name = file.GetName()
	fileWebResult.Platform = file.GetPlatform()
	fileWebResult.OpenedAt = file.GetOpenedAt().Format("02/01/2006 15:04")
	if file.GetSavedAt() != nil {
		fileWebResult.SavedAt = file.GetSavedAt().Format("02/01/2006 15:04")
	}
	return fileWebResult
}

func ConvertFilesToWebResult(files []*domain.File) []*FileWebResult {
	spaceList := make([]*FileWebResult, len(files))
	for index := range files {
		spaceList[index] = ConvertFileToWebResult(files[index])
	}
	return spaceList
}
