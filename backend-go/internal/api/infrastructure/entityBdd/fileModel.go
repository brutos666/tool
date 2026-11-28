package entityBdd

import (
	"time"

	"goTool/internal/api/domain"
)

type FileModel struct {
	Name      string     `db:"name"`
	Platform  string     `db:"platform"`
	Opened_at time.Time  `db:"opened_at"`
	Saved_at  *time.Time `db:"saved_at"`
}

func (fileBdd FileModel) ConvertToFile() *domain.File {
	file := new(domain.File)
	file.SetName(fileBdd.Name)
	file.SetPlatform(fileBdd.Platform)
	file.SetOpenedAt(fileBdd.Opened_at)
	file.SetSavedAt(fileBdd.Saved_at)
	return file
}
