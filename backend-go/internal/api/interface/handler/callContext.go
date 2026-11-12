package handler

import (
	"goTool/internal/api/domain"
	"goTool/internal/api/interface/handler/authentication"
)

type CallContext struct {
	dataAccessId   int
	tokenGenerator *authentication.TokensGenerator
	user           *domain.ConnectedUser
}

func (c *CallContext) AddConnectedUser(user *domain.ConnectedUser)       { c.user = user }
func (c *CallContext) AddDataAccessId(dataAccessId int)                  { c.dataAccessId = dataAccessId }
func (c CallContext) GetDataAccessId() int                               { return c.dataAccessId }
func (c CallContext) GetTokenGenerator() *authentication.TokensGenerator { return c.tokenGenerator }
func (c CallContext) GetConnectedUser() *domain.ConnectedUser            { return c.user }

func WithConnectedUser(user *domain.ConnectedUser) CallContext {
	return CallContext{user: user}
}

func WithTokenGenerator(tokenGenerator *authentication.TokensGenerator) CallContext {
	return CallContext{tokenGenerator: tokenGenerator}
}
