package domain

const ROOT_ID = "-1"

// NodeSpace : espace située par rapport aux autres espaces.
type NodeSpace struct {
	space      *Space
	parentId   string
	previousId string
	nextId     string
}

func (nodeSpace NodeSpace) GetSpace() *Space                 { return nodeSpace.space }
func (nodeSpace *NodeSpace) SetSpace(space *Space)           { nodeSpace.space = space }
func (nodeSpace NodeSpace) GetParentId() string              { return nodeSpace.parentId }
func (nodeSpace *NodeSpace) SetParentId(parentId string)     { nodeSpace.parentId = parentId }
func (nodeSpace NodeSpace) GetPreviousId() string            { return nodeSpace.previousId }
func (nodeSpace *NodeSpace) SetPreviousId(previousId string) { nodeSpace.previousId = previousId }
func (nodeSpace NodeSpace) GetNextId() string                { return nodeSpace.nextId }
func (nodeSpace *NodeSpace) SetNextId(nextId string)         { nodeSpace.nextId = nextId }
func (nodeSpace NodeSpace) ApplyModification() {
	if nodeSpace.space.IsToDelete() {
		nodeSpace.space.crudMode = TO_REMOVE
	} else {
		nodeSpace.space.ApplyModification()
	}
}

func CreateNodeSpace(space *Space, parentId, previousId, nextId string) *NodeSpace {
	nodeSpace := new(NodeSpace)
	nodeSpace.space = space
	nodeSpace.parentId = parentId
	nodeSpace.previousId = previousId
	nodeSpace.nextId = nextId
	return nodeSpace
}
