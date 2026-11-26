package domain

import "time"

type FileReader interface {
	Read(p []byte) (n int, err error)
	FileName() string
}

type File struct {
	name        string
	platform    string
	opened_at   time.Time
	saved_at    *time.Time
	exported_at *time.Time
}

func (file File) GetName() string                      { return file.name }
func (file *File) SetName(firstName string)            { file.name = firstName }
func (file File) GetPlatform() string                  { return file.platform }
func (file *File) SetPlatform(platform string)         { file.platform = platform }
func (file File) GetOpenedAt() time.Time               { return file.opened_at }
func (file *File) SetOpenedAt(openedAt time.Time)      { file.opened_at = openedAt }
func (file File) GetSavedAt() *time.Time               { return file.saved_at }
func (file *File) SetSavedAt(savedAt *time.Time)       { file.saved_at = savedAt }
func (file File) GetExportedAt() *time.Time            { return file.exported_at }
func (file *File) SetExportedAt(exportedAt *time.Time) { file.exported_at = exportedAt }
