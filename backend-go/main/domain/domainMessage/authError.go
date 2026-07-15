package domainMessage

const (
	CAUSE         = "token_cause"
	TOKEN_ABSENT  = "no_token"
	TOKEN_EXPIRED = "token_expired"
	TOKEN_INVALID = "invalid_token"
)

type TokenError struct {
	message *Message
}

func (err TokenError) SetTokenAbsent()  { err.message.AddContext(CAUSE, TOKEN_ABSENT) }
func (err TokenError) SetTokenExpired() { err.message.AddContext(CAUSE, TOKEN_EXPIRED) }
func (err TokenError) SetTokenInvalid() { err.message.AddContext(CAUSE, TOKEN_INVALID) }
func (err TokenError) GetCause() string { return err.message.GetContext(CAUSE) }
func (error TokenError) Error() string {
	return error.message.ToString()
}

func TokenErrorf(error string, args ...any) TokenError {
	message := MessagePrintf(error, args...)
	return TokenError{message: &message}
}
