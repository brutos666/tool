package entity

import (
	"time"
)

type UserModel struct {
	ID           int       `db:"id"`
	FirstName    *string   `db:"first_name"`
	LastName     *string   `db:"last_name"`
	Password     *string   `db:"password"`
	Email        *string   `db:"email"`
	Token        *string   `db:"token,omitempty"`
	Role         *string   `db:"role"`
	RefreshToken *string   `db:"refresh_token,omitempty"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

func (userModel UserModel) ConvertToUser() *User {
	user := new(User)
	user.SetID(userModel.ID)
	user.SetFirstName(*userModel.FirstName)
	user.SetLastName(*userModel.LastName)
	user.SetPassword(*userModel.Password)
	user.SetEmail(*userModel.Email)
	user.SetRole(*userModel.Role)
	return user
}
