package application

import (
	"context"

	"goTool/domain"
)

type InitService struct {
	repository domain.DataInitRepository
}

func DataInitService(repository domain.DataInitRepository) InitService {
	return InitService{repository: repository}
}

func (service InitService) Init(ctx context.Context) error {
	return service.repository.Init(ctx)
}
