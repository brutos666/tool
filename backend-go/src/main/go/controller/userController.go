package controller

import (
	"context"

	"goTool/entity"
	"goTool/service"
)

func Signup(ctx context.Context, userWebResult entity.RegisterUserWebResult) (*entity.UserWebResult, error) {
	user := userWebResult.ConvertToUser()
	result, err := service.Signup(ctx, *user)
	if err != nil {
		return nil, err
	}
	return result.ConvertToUserWebResult(), nil
}

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
