package mock

import (
	"goTool/generic"
)

type DataAccessProviderMock struct{}

func (access *DataAccessProviderMock) ProvideAccess(accessType string) generic.DataAccess {
	return &DataAccessMock{accessType: accessType}
}

type DataAccessServiceMock struct {
	dataAccess *DataAccessMock
}

func (access *DataAccessServiceMock) OpenAccess(accessType string) (int, error) {
	access.dataAccess = &DataAccessMock{accessType: accessType}
	return 0, nil
}
func (access *DataAccessServiceMock) CloseAccess(identity int, err error) error { return nil }

func (access *DataAccessServiceMock) GetMockAccess() *DataAccessMock { return access.dataAccess }
