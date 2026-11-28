package application

import (
	"context"

	"goTool/internal/api/domain"
)

type AppService struct {
	fileRepository    domain.FileQueryRepository
	fileCmdRepository domain.FileCommandRepository
}

func AppInfosService(repository domain.FileQueryRepository, cmdRepository domain.FileCommandRepository) AppService {
	return AppService{fileRepository: repository, fileCmdRepository: cmdRepository}
}

func (appService AppService) GiveInfos(ctx context.Context, dataAccessId int) ([]*domain.File, error) {
	return appService.fileRepository.GiveLastOpened(ctx, dataAccessId)
}

func (appService AppService) RegisterFile(ctx context.Context, dataAccessId int, file domain.File) (*domain.File, error) {
	return appService.fileCmdRepository.AddFile(ctx, dataAccessId, file.GetName())
}
