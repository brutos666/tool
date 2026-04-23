package com.brutos.tool.handler.webResult;

public class TreeInfosWebResult {
    private ItemWebResult item;
    private Long previousItemId;
    private Long parentItemId;
    private Long nextItemId;

    public TreeInfosWebResult(ItemWebResult item, Long previousItemId, Long parentItemId, Long nextItemId) {
        this.item = item;
        this.previousItemId = previousItemId;
        this.parentItemId = parentItemId;
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

    public Long getParentItemId() {
        return parentItemId;
    }

    public void setParentItemId(Long parentItemId) {
        this.parentItemId = parentItemId;
    }
}
