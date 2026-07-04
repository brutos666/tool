package webResult

import (
	"goTool/domain"
)

type NodeSpaceWebResult struct {
	Space          SpaceWebResult `json:"item"`
	PreviousItemId string         `json:"previousItemId"`
	ParentItemId   string         `json:"parentItemId"`
	NextItemId     string         `json:"nextItemId,omitempty"`
}

func (node NodeSpaceWebResult) ConvertToNodeSpace() *domain.NodeSpace {
	nodeSpaceParam := new(domain.NodeSpace)
	nodeSpaceParam.SetSpace(node.Space.ConvertToSpace())
	nodeSpaceParam.SetPreviousId(node.PreviousItemId)
	nodeSpaceParam.SetParentId(node.ParentItemId)
	nodeSpaceParam.SetNextId(node.NextItemId)
	return nodeSpaceParam
}

func ConvertNodeSpaceToWebResult(nodeSpace *domain.NodeSpace) *NodeSpaceWebResult {
	nodeWebResult := new(NodeSpaceWebResult)
	nodeWebResult.Space = *ConvertSpaceToWebResult(nodeSpace.GetSpace())
	nodeWebResult.PreviousItemId = nodeSpace.GetPreviousId()
	nodeWebResult.ParentItemId = nodeSpace.GetParentId()
	nodeWebResult.NextItemId = nodeSpace.GetNextId()
	return nodeWebResult
}
