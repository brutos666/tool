package application

import (
	"context"

	"goTool/internal/api/domain"
)

type AppService struct {
	fileRepository domain.FileQueryRepository
}

func AppInfosService(repository domain.FileQueryRepository) AppService {
	return AppService{fileRepository: repository}
}

func (appService AppService) GiveInfos(ctx context.Context, dataAccessId int) ([]*domain.File, error) {
	return appService.fileRepository.GiveLastOpened(ctx, dataAccessId)
}
