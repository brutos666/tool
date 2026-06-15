package entity

type TreeInfosWebResult struct {
    ItemResult ItemWebResult `json:"item"`
    PreviousItemId int64 `json:"previousItemId"`
    ParentItemId int64 `json:"parentItemId"`
    NextItemId int64 `json:"nextItemId"`
}

type TreeInfos struct {
    pItem *Item
    previousItemId int64
    parentItemId int64
    nextItemId int64
}
func (treeInfos TreeInfos) GetItem() *Item {	return treeInfos.pItem }
func (treeInfos TreeInfos) GetPreviousItemId() int64 {	return treeInfos.previousItemId }
func (treeInfos TreeInfos) GetParentItemId() int64 {	return treeInfos.parentItemId }
func (treeInfos TreeInfos) GetNextItemId() int64 {	return treeInfos.nextItemId }

func (treeInfosWebResult TreeInfosWebResult) ConvertToTreeInfos() TreeInfos {
	var treeInfos TreeInfos
	treeInfos.pItem = treeInfosWebResult.ItemResult.ConvertToItem()
	treeInfos.previousItemId = treeInfosWebResult.PreviousItemId
	treeInfos.parentItemId = treeInfosWebResult.ParentItemId
	treeInfos.nextItemId = treeInfosWebResult.NextItemId
	return treeInfos
}

func (treeInfos TreeInfos) ConvertToTreeInfosWebResult() TreeInfosWebResult {
	var treeInfosWebResult TreeInfosWebResult
	treeInfosWebResult.ItemResult = treeInfos.pItem.ConvertToWebResult()
	treeInfosWebResult.PreviousItemId = treeInfos.previousItemId
	treeInfosWebResult.ParentItemId = treeInfos.parentItemId
	treeInfosWebResult.NextItemId = treeInfos.nextItemId
	return treeInfosWebResult
}