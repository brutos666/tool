package controller

import (
	"context"

	"goTool/entity"
	"goTool/service"
)

func FindAllUsers(ctx context.Context) ([]entity.UserWebResult, error) {
	usersWebResult := []entity.UserWebResult{}
	usersFromBase, err := service.FindAllUsers(ctx)
	if err != nil {
		return nil, err
	}
	for _, user := range usersFromBase {
		usersWebResult = append(usersWebResult, *user.ConvertToUserWebResult())
	}
	return usersWebResult, nil
}
