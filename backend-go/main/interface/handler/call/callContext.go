package call

import "goTool/domain"

type CallContext struct {
	dataAccess     domain.DataAccess
	tokenGenerator domain.TokensProduct
	user           *domain.ConnectedUser
}

func (c *CallContext) AddConnectedUser(user *domain.ConnectedUser) { c.user = user }

func WithContext(dataAccess domain.DataAccess, user *domain.ConnectedUser) CallContext {
	return CallContext{dataAccess: dataAccess, user: user}
}

func WithLoginContext(dataAccess domain.DataAccess, tokenGenerator domain.TokensProduct) CallContext {
	return CallContext{dataAccess: dataAccess, tokenGenerator: tokenGenerator}
}
