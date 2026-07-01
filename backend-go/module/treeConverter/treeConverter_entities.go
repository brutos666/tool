package treeConverter

type (
	TreeEntity interface {
		GetId() int64
		SetChildren(children []TreeEntity)
		SetStatus(status string)
		GetStatus() string
	}

	FlatEntity interface {
		GetId() int64
		GetParentId() int64
		GetNextIdValue() int64
		IsNextIdNull() bool
		ConvertToTree() TreeEntity
	}
)
