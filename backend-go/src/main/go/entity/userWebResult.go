package entity

type UserWebResult struct {
	ID         int     `json:"id"`
	First_name *string `json:"first_name" validate:"required,min=2,max=100"`
	Last_name  *string `json:"last_name" validate:"required,min=2,max=100"`
	Password   *string `json:"password" validate:"required,min=6"`
	Email      *string `json:"email" validate:"email,required"`
	Role       *string `json:"role" validate:"required,eq=ADMIN|eq=USER"`
}
