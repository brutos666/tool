package application

import (
	"context"

	"goTool/internal/api/domain"
)

type UserQryService struct {
	repository domain.UserQueryRepository
}

func UserQueryService(repository domain.UserQueryRepository) UserQryService {
	return UserQryService{repository: repository}
}

func (queryService UserQryService) FindAll(ctx context.Context, dataAccessId int) ([]*domain.User, error) {
	return queryService.repository.FindAll(ctx, dataAccessId)
}
