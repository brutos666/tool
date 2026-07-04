package entity

type User struct {
	id        int
	firstName string
	lastName  string
	password  string
	email     string
	role      string
}

func (user User) GetID() int                     { return user.id }
func (user *User) SetID(id int)                  { user.id = id }
func (user User) GetFirstName() string           { return user.firstName }
func (user *User) SetFirstName(firstName string) { user.firstName = firstName }
func (user User) GetLastName() string            { return user.lastName }
func (user *User) SetLastName(lastName string)   { user.lastName = lastName }
func (user User) GetPassword() string            { return user.password }
func (user *User) SetPassword(password string)   { user.password = password }
func (user User) GetEmail() string               { return user.email }
func (user *User) SetEmail(email string)         { user.email = email }
func (user User) GetRole() string                { return user.role }
func (user *User) SetRole(role string)           { user.role = role }

func (user User) ConvertToUserWebResult() *UserWebResult {
	userWebResult := new(UserWebResult)
	userWebResult.FirstName = user.firstName
	userWebResult.LastName = user.lastName
	userWebResult.Email = user.email
	userWebResult.Role = user.role
	return userWebResult
}
