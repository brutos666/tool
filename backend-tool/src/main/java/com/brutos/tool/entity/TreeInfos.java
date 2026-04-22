package com.brutos.tool.entity;

import java.util.Objects;

public class TreeInfos {
    private Tree<Item> treeItem;
    private Long previousItemId;
    private Long parentItemId;
    private Long nextItemId;

    public TreeInfos(Tree<Item> treeItem, Long previousItemId, Long parentItemId, Long nextItemId) {
        this.treeItem = treeItem;
        this.previousItemId = previousItemId;
        this.parentItemId = parentItemId;
        this.nextItemId = nextItemId;
    }

    public Tree<Item> getTreeItem() {
        return treeItem;
    }

    public void setTreeItem(Tree<Item> treeItem) {
        this.treeItem = treeItem;
    }

    public Long getPreviousItemId() {
        return previousItemId;
    }

    public void setPreviousItemId(Long previousItemId) {
        this.previousItemId = previousItemId;
    }

    public Long getParentItemId() {
        return parentItemId;
    }

    public void setParentItemId(Long parentItemId) {
        this.parentItemId = parentItemId;
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
                ", previousItemId=" + previousItemId +
                ", parentId=" + parentItemId +
                ", nextItemId=" + nextItemId +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        TreeInfos treeInfos = (TreeInfos) o;
        return Objects.equals(treeItem, treeInfos.treeItem) && Objects.equals(previousItemId, treeInfos.previousItemId) && Objects.equals(parentItemId, treeInfos.parentItemId) && Objects.equals(nextItemId, treeInfos.nextItemId);
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(treeItem);
        result = 31 * result + Objects.hashCode(previousItemId);
        result = 31 * result + Objects.hashCode(parentItemId);
        result = 31 * result + Objects.hashCode(nextItemId);
        return result;
    }
}
