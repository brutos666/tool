package com.brutos.tool.handler.webResult;

public class ItemToSaveWebResult {
    private ItemWebResult item;
    private ItemWebResult previousItem;
    private Long parentId;
    private Long nextItemId;

    public ItemToSaveWebResult(ItemWebResult item, ItemWebResult previousItem, Long parentId, Long nextItemId) {
        this.item = item;
        this.previousItem = previousItem;
        this.parentId = parentId;
        this.nextItemId = nextItemId;
    }

    public ItemWebResult getItem() {
        return item;
    }

    public void setItem(ItemWebResult item) {
        this.item = item;
    }

    public ItemWebResult getPreviousItem() {
        return previousItem;
    }

    public void setPreviousItem(ItemWebResult previousItem) {
        this.previousItem = previousItem;
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
