package repository

import (
	"context"

	"goTool/internal/api/config"
	"goTool/internal/api/domain"
	"goTool/internal/api/infrastructure/bddService"
)

const (
	INSERT_FILE string = "INSERT INTO file (name, platform, opened_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET opened_at = CURRENT_TIMESTAMP"
	DELETE_FILE string = "DELETE FROM file WHERE name NOT IN (SELECT name FROM file ORDER BY opened_at DESC LIMIT 10)"
)

func FileCommand() domain.FileCommandRepository {
	return &fileCmdRepository{}
}

type fileCmdRepository struct{}

func (repository *fileCmdRepository) AddFile(ctx context.Context, dataAccessId int, name string) error {
	return doAddFile(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId), name)
}

func (repository *fileCmdRepository) DeleteOldFiles(ctx context.Context, dataAccessId int) error {
	return doDeleteFiles(ctx, bddAccessService.RetrieveWriteAccess(dataAccessId))
}

func doAddFile(ctx context.Context, dataBase bddService.WriteCommands, name string) error {
	_, err := dataBase.Exec(ctx, INSERT_FILE, name, config.GetProperties().GetPlatForm())
	if err != nil {
		return err
	}
	return nil
}

func doDeleteFiles(ctx context.Context, dataBase bddService.WriteCommands) error {
	_, err := dataBase.Exec(ctx, DELETE_FILE)
	return err
}
