package com.brutos.tool.entity;

import java.util.Objects;
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

    @Override
    public String toString() {
        return "TreeInfos{" +
                "treeItem=" + treeItem +
                ", previousItem=" + previousItem +
                ", parentId=" + parentId +
                ", nextItemId=" + nextItemId +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        TreeInfos treeInfos = (TreeInfos) o;
        return Objects.equals(treeItem, treeInfos.treeItem) && Objects.equals(previousItem, treeInfos.previousItem) && Objects.equals(parentId, treeInfos.parentId) && Objects.equals(nextItemId, treeInfos.nextItemId);
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(treeItem);
        result = 31 * result + Objects.hashCode(previousItem);
        result = 31 * result + Objects.hashCode(parentId);
        result = 31 * result + Objects.hashCode(nextItemId);
        return result;
    }
}
