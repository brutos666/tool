package repository

import (
	"context"

	"goTool/internal/api/domain"
	"goTool/internal/api/infrastructure/bddService"
	"goTool/internal/api/infrastructure/entityBdd"
)

const SELECT_FILE_NAMES string = "SELECT name, platform, opened_at, saved_at FROM file ORDER BY opened_at DESC"

type fileQryRepository struct{}

func FileQuery() domain.FileQueryRepository {
	return &fileQryRepository{}
}

func (repo *fileQryRepository) GiveLastOpened(ctx context.Context, dataAccessId int) ([]*domain.File, error) {
	return selectAllFiles(ctx, bddAccessService.RetrieveReadAccess(dataAccessId))
}

func selectAllFiles(ctx context.Context, dataBase bddService.ReadCommands) ([]*domain.File, error) {
	var filesModel []entityBdd.FileModel
	err := dataBase.Select(ctx, SELECT_FILE_NAMES, &filesModel)
	if err != nil {
		return nil, err
	}
	files := make([]*domain.File, len(filesModel))
	for index := range filesModel {
		files[index] = filesModel[index].ConvertToFile()
	}
	return files, nil
}
