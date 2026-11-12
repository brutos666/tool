package mock

import "goTool/internal/api/infrastructure/bddService"

func BddAccessServiceMock() BddServiceMock {
	bddServiceMock := new(BddServiceMock)
	bddServiceMock.readDataAccess = &BddAccessMock{accessType: bddService.READ}
	bddServiceMock.writeDataAccess = &BddAccessMock{accessType: bddService.WRITE}
	return *bddServiceMock
}

type BddServiceMock struct {
	readDataAccess  *BddAccessMock
	writeDataAccess *BddAccessMock
}

func (service BddServiceMock) RetrieveReadAccess(identity int) bddService.ReadCommands {
	return service.readDataAccess
}

func (service BddServiceMock) RetrieveWriteAccess(identity int) bddService.WriteCommands {
	return service.writeDataAccess
}

func (access *BddServiceMock) RetrieveMockAccessRead() *BddAccessMock { return access.readDataAccess }

func (access *BddServiceMock) RetrieveMockAccessWrite() *BddAccessMock { return access.writeDataAccess }
