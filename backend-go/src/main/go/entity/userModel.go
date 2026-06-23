package entity

import (
	"time"
)

type UserModel struct {
	ID            int       `db:"id"`
	First_name    *string   `db:"first_name"`
	Last_name     *string   `db:"last_name"`
	Password      *string   `db:"password"`
	Email         *string   `db:"email"`
	Token         *string   `db:"token,omitempty"`
	Role          *string   `db:"role"`
	Refresh_token *string   `db:"refresh_token,omitempty"`
	Created_at    time.Time `db:"created_at"`
	Updated_at    time.Time `db:"updated_at"`
}

func (userModel UserModel) ConvertToUser() *User {
	user := new(User)
	user.SetID(userModel.ID)
	user.SetFirstName(*userModel.First_name)
	user.SetLastName(*userModel.Last_name)
	user.SetPassword(*userModel.Password)
	user.SetEmail(*userModel.Email)
	user.SetRole(*userModel.Role)
	return user
}
