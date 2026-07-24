package generic

type DataAccessService interface {
	OpenAccess(accessType string) (int, error)
	CloseAccess(identity int, err error) error
}

type DataAccessProvider interface {
	ProvideAccess(accessType string) DataAccess
}
type DataAccess interface {
	Open() error
	Close() error
	Cancel() error
}
