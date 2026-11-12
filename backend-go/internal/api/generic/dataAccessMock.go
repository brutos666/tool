// Package generic fourni les interfaces communes entre l'infrastructure et l'interface, mais n'a aucun rapport avec la logique métier
package generic

type DataAccessMock struct {
	open   bool
	cancel bool
}

func (c *DataAccessMock) IsOpen() bool      { return c.open }
func (c *DataAccessMock) IsCancelled() bool { return c.cancel }
func (c *DataAccessMock) Open() error {
	c.open = true
	return nil
}

func (c *DataAccessMock) Close() error {
	c.open = false
	return nil
}

func (c *DataAccessMock) Cancel() error {
	c.cancel = true
	return nil
}
