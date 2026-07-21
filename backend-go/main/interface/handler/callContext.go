package handler

import "goTool/domain"

type CallContext struct {
	dataAccess     domain.DataAccess
	tokenGenerator domain.TokensProduct
	user           *domain.ConnectedUser
}

func (c *CallContext) AddConnectedUser(user *domain.ConnectedUser) { c.user = user }
func (c *CallContext) AddDataAccess(dataAccess domain.DataAccess)  { c.dataAccess = dataAccess }

func WithConnectedUser(user *domain.ConnectedUser) CallContext {
	return CallContext{user: user}
}

func WithTokenGenerator(tokenGenerator domain.TokensProduct) CallContext {
	return CallContext{tokenGenerator: tokenGenerator}
}
