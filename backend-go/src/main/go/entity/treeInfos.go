package entity

import "goTool/utilities"

type TreeInfosWebResult struct {
    ItemResult ItemWebResult `json:"item"`
    PreviousItemId int64 `json:"previousItemId"`
    ParentItemId int64 `json:"parentItemId"`
    NextItemId *utilities.NullInt64 `json:"nextItemId,omitempty"`
}


type TreeInfos struct {
    pItem *Item
    previousItemId int64
    parentItemId int64
    nextItemId *utilities.NullInt64
}
func (treeInfos TreeInfos) GetItem() *Item {	return treeInfos.pItem }
func (treeInfos TreeInfos) GetPreviousItemId() int64 {	return treeInfos.previousItemId }
func (treeInfos TreeInfos) GetParentItemId() int64 {	return treeInfos.parentItemId }
func (treeInfos TreeInfos) GetNextItemId() *utilities.NullInt64 {	return treeInfos.nextItemId }

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