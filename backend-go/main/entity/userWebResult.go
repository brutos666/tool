package entity

type UserWebResult struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"email,required"`
	Role      string `json:"role" validate:"required,eq=ADMIN|eq=USER"`
}

type RegisterUserWebResult struct {
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Password  string `json:"password" validate:"required,min=8"`
	Email     string `json:"email" validate:"email,required"`
}

func (userWebResult UserWebResult) ConvertToUser() *User {
	return &User{
		id:        userWebResult.ID,
		firstName: userWebResult.FirstName,
		lastName:  userWebResult.LastName,
		email:     userWebResult.Email,
		role:      userWebResult.Role,
	}
}

func (userWebResult RegisterUserWebResult) ConvertToUser() *User {
	return &User{
		id:        0,
		firstName: userWebResult.FirstName,
		lastName:  userWebResult.LastName,
		password:  userWebResult.Password,
		email:     userWebResult.Email,
		role:      "USER",
	}
}
