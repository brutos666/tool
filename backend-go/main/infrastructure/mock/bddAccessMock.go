package mock

import "context"

type BddAccessMock struct {
	accessType string
	deleteIds  []string
}

func (c BddAccessMock) GetDeleteIds() []string { return c.deleteIds }
func (c BddAccessMock) Clear() {
	c.deleteIds = []string{}
}

func (c BddAccessMock) Select(ctx context.Context, sql string, modelsOut any, args ...any) error {
	return nil
}

func (c BddAccessMock) Insert(ctx context.Context, sql string, modelInOut any) error {
	return nil
}

func (c BddAccessMock) Update(ctx context.Context, sql string, args ...any) (int, error) {
	return 0, nil
}

func (c BddAccessMock) UpdateModel(ctx context.Context, sql string, modelIn any) (int, error) {
	return 0, nil
}

func (c *BddAccessMock) DeleteIn(ctx context.Context, sql string, inValues []string) (int, error) {
	c.deleteIds = append(c.deleteIds, inValues...)
	return len(inValues), nil
}

func (c BddAccessMock) LaunchSQLScript(ctx context.Context, filepath string) (int, error) {
	return 0, nil
}
