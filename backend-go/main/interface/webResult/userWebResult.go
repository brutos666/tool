package webResult

import "goTool/domain"

type UserWebResult struct {
	Id        string `json:"id"`
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"email,required"`
	Role      string `json:"role" validate:"required,eq=ADMIN|eq=USER"`
}

func ConvertUserToWebResult(user *domain.User) *UserWebResult {
	userModel := new(UserWebResult)
	userModel.Id = user.GetId()
	userModel.FirstName = user.GetFirstName()
	userModel.LastName = user.GetLastName()
	userModel.Email = user.GetEmail()
	userModel.Role = user.GetRole()
	return userModel
}

type RegisterUserWebResult struct {
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Password  string `json:"password" validate:"required,min=8"`
	Email     string `json:"email" validate:"email,required"`
}

func (userWebResult RegisterUserWebResult) ConvertToUser() *domain.User {
	user := new(domain.User)
	user.SetFirstName(userWebResult.FirstName)
	user.SetLastName(userWebResult.LastName)
	user.SetPassword(userWebResult.Password)
	user.SetEmail(userWebResult.Email)
	user.SetRole("USER")
	return user
}

type LoginUserWebResult struct {
	Email    string `json:"email" validate:"email,required"`
	Password string `json:"password" validate:"required,min=8"`
}

func (userWebResult LoginUserWebResult) ConvertToLoginUser() *domain.LoginUser {
	user := new(domain.LoginUser)
	user.SetPassword(userWebResult.Password)
	user.SetEmail(userWebResult.Email)
	return user
}

type LoggedUserWebResult struct {
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Token     string `json:"token"`
}

func ConvertLoggedUserToWebResult(loggedUser *domain.LoggedUser, accessToken string) *LoggedUserWebResult {
	userWebResult := new(LoggedUserWebResult)
	userWebResult.FirstName = loggedUser.GetUser().GetFirstName()
	userWebResult.LastName = loggedUser.GetUser().GetLastName()
	userWebResult.Token = accessToken
	return userWebResult
}
