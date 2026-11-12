package generic

type DataAccessProviderMock struct{}

func (access *DataAccessProviderMock) ProvideAccess(accessType string) DataAccess {
	return &DataAccessMock{}
}

type DataAccessServiceMock struct {
	dataAccess *DataAccessMock
}

func (access *DataAccessServiceMock) OpenAccess(accessType string) (int, error) {
	access.dataAccess = &DataAccessMock{}
	return 0, nil
}
func (access *DataAccessServiceMock) CloseAccess(identity int, err error) error { return nil }

func (access *DataAccessServiceMock) GetMockAccess() *DataAccessMock { return access.dataAccess }
