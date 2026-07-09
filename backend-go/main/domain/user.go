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

type LoginUser struct {
	email    string
	password string
}

func (user LoginUser) GetEmail() string             { return user.email }
func (user *LoginUser) SetEmail(email string)       { user.email = email }
func (user LoginUser) GetPassword() string          { return user.password }
func (user *LoginUser) SetPassword(password string) { user.password = password }

type LoggedUser struct {
	user         User
	token        string
	refreshToken string
}

func (loggedUser LoggedUser) GetUser() User           { return loggedUser.user }
func (loggedUser LoggedUser) GetToken() string        { return loggedUser.token }
func (loggedUser LoggedUser) GetRefreshToken() string { return loggedUser.refreshToken }

func CreateLoggedUser(user User, token string, refreshToken string) *LoggedUser {
	loggedUser := new(LoggedUser)
	loggedUser.user = user
	loggedUser.token = token
	loggedUser.refreshToken = refreshToken
	return loggedUser
}

// ConnectedUser : informations minimums sur l'utilisateur connecté
type ConnectedUser struct {
	UserId string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

func (user ConnectedUser) GetId() string    { return user.UserId }
func (user ConnectedUser) GetEmail() string { return user.Email }
func (user ConnectedUser) GetRole() string  { return user.Role }

func CreateConnectedUser(user User) *ConnectedUser {
	connectedUser := new(ConnectedUser)
	connectedUser.UserId = user.GetId()
	connectedUser.Email = user.GetEmail()
	connectedUser.Role = user.GetRole()
	return connectedUser
}
