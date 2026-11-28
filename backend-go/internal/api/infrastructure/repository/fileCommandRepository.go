package repository

import (
	"context"

	"goTool/internal/api/config"
	"goTool/internal/api/domain"
	"goTool/internal/api/infrastructure/bddService"
	"goTool/internal/api/infrastructure/entityBdd"
)

const (
	INSERT_FILE string = "INSERT INTO file (name, platform, opened_at) VALUES (:name, :platform, CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET opened_at = CURRENT_TIMESTAMP RETURNING *"
	DELETE_FILE string = "DELETE FROM file WHERE name NOT IN (SELECT name FROM file ORDER BY opened_at DESC LIMIT 10)"
)

func FileCommand() domain.FileCommandRepository {
	return &fileCmdRepository{}
}

type fileCmdRepository struct{}

func (repository *fileCmdRepository) AddFile(ctx context.Context, dataAccessId int, name string) (*domain.File, error) {
	return doAddFile(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId), name)
}

func (repository *fileCmdRepository) DeleteOldFiles(ctx context.Context, dataAccessId int) error {
	return doDeleteFiles(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId))
}

func doAddFile(ctx context.Context, dataBase bddService.WriteCommands, name string) (*domain.File, error) {
	fileModel := &entityBdd.FileModel{Name: name, Platform: config.GetProperties().GetPlatForm()}
	err := dataBase.Insert(ctx, INSERT_FILE, fileModel)
	if err != nil {
		return nil, err
	}
	return fileModel.ConvertToFile(), nil
}

func doDeleteFiles(ctx context.Context, dataBase bddService.WriteCommands) error {
	_, err := dataBase.Exec(ctx, DELETE_FILE)
	return err
}
