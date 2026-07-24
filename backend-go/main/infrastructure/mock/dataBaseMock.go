package mock

import "context"

type DataAccessMock struct {
	open       bool
	cancel     bool
	accessType string
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

func (c DataAccessMock) Select(ctx context.Context, sql string, modelsOut any, args ...any) error {
	return nil
}

func (c DataAccessMock) Insert(ctx context.Context, sql string, modelInOut any) error {
	return nil
}

func (c DataAccessMock) Update(ctx context.Context, sql string, args ...any) (int, error) {
	return 0, nil
}

func (c DataAccessMock) UpdateModel(ctx context.Context, sql string, modelIn any) (int, error) {
	return 0, nil
}

func (c DataAccessMock) DeleteIn(ctx context.Context, sql string, inValues []string) (int, error) {
	return 0, nil
}

func (c DataAccessMock) LaunchSQLScript(ctx context.Context, filepath string) (int, error) {
	return 0, nil
}
