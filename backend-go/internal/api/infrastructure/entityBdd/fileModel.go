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

func (fileBdd FileModel) ConvertToUser() *domain.File {
	user := new(domain.File)
	user.SetName(fileBdd.Name)
	user.SetPlatform(fileBdd.Platform)
	user.SetOpenedAt(fileBdd.Opened_at)
	user.SetSavedAt(fileBdd.Saved_at)
	return user
}
