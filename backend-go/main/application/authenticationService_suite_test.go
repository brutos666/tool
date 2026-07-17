package application

import (
	"goTool/domain"
	"goTool/domain/domainMessage"

	"github.com/mvrahden/go-test/pkg/gotest"
)

const (
	ID            = "01234567"
	EMAIL         = "alice@example.com"
	ROLE          = "ADMIN"
	EMPTY_TOKEN   = ""
	VALID_TOKEN   = "tokenvalid"
	INVALID_TOKEN = "tokeninvalid"
	EXPIRED_TOKEN = "tokenexpired"
)

type AuthServiceTestSuite struct {
	svc            AuthService
	tokenGenerator TokenGeneratorMock
}

func (s *AuthServiceTestSuite) BeforeEach(t *gotest.T) {
	s.svc = AuthentificationService()
	s.tokenGenerator = TokenGeneratorMock{}
}

type TokenGeneratorMock struct{}

func (tokenGenerator TokenGeneratorMock) Validate(token string) (connectedUser *domain.ConnectedUser, valid bool, expired bool) {
	if token == EMPTY_TOKEN || token == INVALID_TOKEN {
		valid = false
	} else if token == VALID_TOKEN {
		connectedUser = domain.CreateConnectedUser(ID, EMAIL, ROLE)
		valid = true
	} else if token == EXPIRED_TOKEN {
		expired = true
	}
	return
}

func (s *AuthServiceTestSuite) TestVerify(t *gotest.T) {
	t.It("Vérification d'un jeton valide", func(it *gotest.T) {
		connectedUser, err := s.svc.Verify(VALID_TOKEN, s.tokenGenerator)
		gotest.NoError(it, err)
		gotest.NotZero(it, connectedUser)
	})

	t.When("Le jeton est vide", func(w *gotest.T) {
		w.It("retourne une erreur indiquant que l'utilisateur n'est pas connecté avec une cause de token absent", func(it *gotest.T) {
			connectedUser, err := s.svc.Verify(EMPTY_TOKEN, s.tokenGenerator)

			expectedError := domainMessage.TokenErrorf(NOT_LOGGED)
			expectedError.SetTokenAbsent()
			gotest.ErrorIs(it, err, expectedError)
			gotest.Zero(it, connectedUser)
		})
	})
	t.When("Le jeton est expiré", func(w *gotest.T) {
		w.It("retourne une erreur indiquant que l'accès n'est pas autorisé avec une cause de token expiré", func(it *gotest.T) {
			connectedUser, err := s.svc.Verify(EXPIRED_TOKEN, s.tokenGenerator)

			expectedError := domainMessage.TokenErrorf(NOT_AUTHORIZED)
			expectedError.SetTokenExpired()
			gotest.ErrorIs(it, err, expectedError)
			gotest.Zero(it, connectedUser)
		})
	})
	t.When("Le jeton est invalide", func(w *gotest.T) {
		w.It("retourne une erreur indiquant que l'accès n'est pas autorisé avec une cause de token invalide", func(it *gotest.T) {
			connectedUser, err := s.svc.Verify(INVALID_TOKEN, s.tokenGenerator)

			expectedError := domainMessage.TokenErrorf(NOT_AUTHORIZED)
			expectedError.SetTokenInvalid()
			gotest.ErrorIs(it, err, expectedError)
			gotest.Zero(it, connectedUser)
		})
	})
}
