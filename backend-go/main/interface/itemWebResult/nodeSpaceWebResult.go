package itemWebResult

import (
	"goTool/domain"
)

type NodeSpaceWebResult struct {
	SpaceWebResult ItemWebResult `json:"item"`
	PreviousItemId string        `json:"previousItemId"`
	ParentItemId   string        `json:"parentItemId"`
	NextItemId     string        `json:"nextItemId,omitempty"`
}

func (node NodeSpaceWebResult) ConvertToParam() any {
	nodeSpaceParam := new(domain.NodeSpace)
	nodeSpaceParam.SetSpace(node.SpaceWebResult.ConvertToParam())
	nodeSpaceParam.SetPreviousId(node.PreviousItemId)
	nodeSpaceParam.SetParentId(node.ParentItemId)
	nodeSpaceParam.SetNextId(node.NextItemId)
	return nodeSpaceParam
}

func ConvertNodeSpaceToWebResult(nodeSpace *domain.NodeSpace) *NodeSpaceWebResult {
	nodeWebResult := new(NodeSpaceWebResult)
	nodeWebResult.SpaceWebResult = *ConvertItemToWebResult(nodeSpace.GetSpace())
	nodeWebResult.PreviousItemId = nodeSpace.GetPreviousId()
	nodeWebResult.ParentItemId = nodeSpace.GetParentId()
	nodeWebResult.NextItemId = nodeSpace.GetNextId()
	return nodeWebResult
}
