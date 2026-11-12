package entityBdd

import (
	"strconv"
	"time"

	"goTool/internal/api/domain"
)

type UserModel struct {
	Id           int       `db:"id"`
	FirstName    string    `db:"first_name"`
	LastName     string    `db:"last_name"`
	Password     string    `db:"password"`
	Email        string    `db:"email"`
	Token        string    `db:"token,omitempty"`
	Role         string    `db:"role"`
	RefreshToken string    `db:"refresh_token,omitempty"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

func (userBdd UserModel) GetId() string { return strconv.Itoa(userBdd.Id) }

// SetId retourne une erreur lorsque l'identifiant ne peut pas être convertit en entier
func (userBdd *UserModel) SetId(id string) error {
	intId, err := strconv.ParseInt(id, 10, 32)
	if err != nil {
		return err
	}
	userBdd.Id = int(intId)
	return nil
}
func (user UserModel) GetFirstName() string              { return user.FirstName }
func (user *UserModel) SetFirstName(firstName string)    { user.FirstName = firstName }
func (user UserModel) GetLastName() string               { return user.LastName }
func (user *UserModel) SetLastName(lastName string)      { user.LastName = lastName }
func (user UserModel) GetPassword() string               { return user.Password }
func (user *UserModel) SetPassword(password string)      { user.Password = password }
func (user UserModel) GetEmail() string                  { return user.Email }
func (user *UserModel) SetEmail(email string)            { user.Email = email }
func (user UserModel) GetRole() string                   { return user.Role }
func (user *UserModel) SetRole(role string)              { user.Role = role }
func (user *UserModel) SetToken(token string)            { user.Token = token }
func (user *UserModel) SetRefreshToken(token string)     { user.RefreshToken = token }
func (user *UserModel) SetCreatedAt(createdAt time.Time) { user.CreatedAt = createdAt }
func (user *UserModel) SetUpdatedAt(updatedAt time.Time) { user.UpdatedAt = updatedAt }

func (userBdd UserModel) ConvertToUser() *domain.User {
	user := new(domain.User)
	user.SetId(userBdd.GetId())
	user.SetFirstName(userBdd.FirstName)
	user.SetLastName(userBdd.LastName)
	user.SetPassword(userBdd.Password)
	user.SetEmail(userBdd.Email)
	user.SetRole(userBdd.Role)
	return user
}

func ConvertUserToModel(user domain.User) *UserModel {
	userModel := new(UserModel)
	err := userModel.SetId(user.GetId())
	if err != nil {
		panic("Incohérence entre les données et la base de données. L'identifiant de l'utilisateur (" + user.GetContext() + ") doit pouvoir être convertit en entier")
	}
	userModel.SetFirstName(user.GetFirstName())
	userModel.SetLastName(user.GetLastName())
	userModel.SetPassword(user.GetPassword())
	userModel.SetEmail(user.GetEmail())
	userModel.SetRole(user.GetRole())
	return userModel
}

func CreateUserToRegister(user domain.User, hashPassword string) *UserModel {
	now := time.Now().UTC()
	userModel := new(UserModel)
	userModel.SetFirstName(user.GetFirstName())
	userModel.SetLastName(user.GetLastName())
	userModel.SetPassword(user.GetPassword())
	userModel.SetEmail(user.GetEmail())
	userModel.SetRole(user.GetRole())
	userModel.SetCreatedAt(now)
	userModel.SetUpdatedAt(now)
	userModel.SetPassword(hashPassword)
	return userModel
}
