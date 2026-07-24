package bddService

import "context"

// BddAccessReadWrite Accès à la base de données pour de la lecture ou de la modification de la base de données
type BddAccessReadWrite interface {
	RetrieveReadAccess(identity int) ReadCommands
	RetrieveWriteAccess(identity int) WriteCommands
}

// ReadCommands Comportement de lecture de la base de données
type ReadCommands interface {
	Select(ctx context.Context, sql string, modelsOut any, args ...any) error
}

// WriteCommands Comportement de mise à jour dans la base de données
type WriteCommands interface {
	ReadCommands
	Insert(ctx context.Context, sql string, modelInOut any) error
	Update(ctx context.Context, sql string, args ...any) (int, error)
	UpdateModel(ctx context.Context, sql string, modelIn any) (int, error)
	DeleteIn(ctx context.Context, sql string, inValues []string) (int, error)
	LaunchSQLScript(ctx context.Context, filepath string) (int, error)
}
