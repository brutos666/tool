package application

import (
	"context"

	"goTool/domain"
)

type UserQryService struct {
	repository domain.UserQueryRepository
}

func UserQueryService(repository domain.UserQueryRepository) UserQryService {
	return UserQryService{repository: repository}
}

func (queryService UserQryService) FindAll(ctx context.Context) ([]*domain.User, error) {
	return queryService.repository.FindAll(ctx)
}
