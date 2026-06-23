package mapper

import "goTool/entity"

func ConvertUsersModelToUsers(usersFromBase []entity.UserModel) []*entity.User {
	users := make([]*entity.User, len(usersFromBase))
	for i, userModel := range usersFromBase {
		users[i] = userModel.ConvertToUser()
	}
	return users
}
