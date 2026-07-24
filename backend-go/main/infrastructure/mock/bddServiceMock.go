package mock

import "goTool/infrastructure/bddAccess"

func BddAccessServiceMock() BddServiceMock {
	bddService := new(BddServiceMock)
	bddService.readDataAccess = &BddAccessMock{accessType: bddAccess.READ}
	bddService.writeDataAccess = &BddAccessMock{accessType: bddAccess.WRITE}
	return *bddService
}

type BddServiceMock struct {
	readDataAccess  *BddAccessMock
	writeDataAccess *BddAccessMock
}

func (service BddServiceMock) ReadAccess(identity int) bddAccess.ReadDataOperation {
	return service.readDataAccess
}

func (service BddServiceMock) WriteAccess(identity int) bddAccess.WriteDataOperation {
	return service.writeDataAccess
}

func (access *BddServiceMock) GetReadAccess() *BddAccessMock  { return access.readDataAccess }
func (access *BddServiceMock) GetWriteAccess() *BddAccessMock { return access.writeDataAccess }
