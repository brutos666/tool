package password

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	hashedPwd := string(bytes)
	return hashedPwd
}
