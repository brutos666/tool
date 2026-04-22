package com.brutos.tool.entity;

import java.util.Optional;

public class TreeInfos {
    private Tree<Item> treeItem;
    private Item previousItem;
    private Long parentId;
    private Long nextItemId;

    public TreeInfos(Tree<Item> treeItem, Item previousItem, Long parentId, Long nextItemId) {
        this.treeItem = treeItem;
        this.previousItem = previousItem;
        this.parentId = parentId;
        this.nextItemId = nextItemId;
    }

    public Tree<Item> getTreeItem() {
        return treeItem;
    }

    public void setTreeItem(Tree<Item> treeItem) {
        this.treeItem = treeItem;
    }

    public Optional<Item> getPreviousItem() {
        if (previousItem == null) {
            return Optional.empty();
        }
        return Optional.of(previousItem);
    }

    public void setPreviousItem(Item previousItem) {
        this.previousItem = previousItem;
    }

    public boolean previousIsNew() {
        return previousItem != null && previousItem.getCRUDMode().isCreate();
    }

    public boolean previousIsDelete() {
        return previousItem != null && previousItem.getCRUDMode().isDelete();
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Long getNextItemId() {
        return nextItemId;
    }

    public void setNextItemId(Long nextItemId) {
        this.nextItemId = nextItemId;
    }
}
