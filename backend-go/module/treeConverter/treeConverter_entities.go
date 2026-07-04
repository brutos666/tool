package treeConverter

type (
	TreeEntity interface {
		GetId() string
		GetChildren() []TreeEntity
		SetChildren(children []TreeEntity)
		SetStatus(status string)
		GetStatus() string
	}

	FlatEntity interface {
		GetId() string
		GetParentId() string
		GetNextId() string
		ConvertToTree() TreeEntity
	}
)
