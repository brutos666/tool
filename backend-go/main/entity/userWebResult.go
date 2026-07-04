package entity

type UserWebResult struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"email,required"`
	Role      string `json:"role" validate:"required,eq=ADMIN|eq=USER"`
}
