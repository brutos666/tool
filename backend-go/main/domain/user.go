package domain

type User struct {
	id        string
	firstName string
	lastName  string
	password  string
	email     string
	role      string
}

func (user User) GetId() string                  { return user.id }
func (user *User) SetId(id string)               { user.id = id }
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
func (user User) GetContext() string {
	return "Identifiant=" + user.id + ", Nom=" + user.firstName + ", Prénom=" + user.lastName
}
