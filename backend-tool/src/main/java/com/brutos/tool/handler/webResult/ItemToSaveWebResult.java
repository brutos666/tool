package com.brutos.tool.handler.webResult;

public class ItemToSaveWebResult {
    private ItemWebResult item;
    private Long previousItemId;
    private Long parentId;
    private Long nextItemId;

    public ItemToSaveWebResult(ItemWebResult item, Long previousItemId, Long parentId, Long nextItemId) {
        this.item = item;
        this.previousItemId = previousItemId;
        this.parentId = parentId;
        this.nextItemId = nextItemId;
    }

    public ItemWebResult getItem() {
        return item;
    }

    public void setItem(ItemWebResult item) {
        this.item = item;
    }

    public Long getPreviousItemId() {
        return previousItemId;
    }

    public void setPreviousItemId(Long previousItemId) {
        this.previousItemId = previousItemId;
    }

    public Long getNextItemId() {
        return nextItemId;
    }

    public void setNextItemId(Long nextItemId) {
        this.nextItemId = nextItemId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}
