package com.brutos.tool.handler.webResult;

public class ItemToSaveWebResult {
    private ItemWebResult item;
    private ItemWebResult previousItem;
    private Long nextItemId;

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
}
