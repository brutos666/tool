package com.brutos.tool.service;

import com.brutos.tool.entity.Status;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.entity.TreeEntity;

import java.util.List;

public class TreeBuilder<T extends TreeEntity> {
    private Tree<T> root = null;
    private Tree<T> currentItem;
    private Tree<T> currentChild;

    public TreeBuilder() {
    }

    public TreeBuilder<T> withRootItem(T item) {
        this.root = new Tree<>(item);
        this.currentItem = this.root;
        return this;
    }

    public TreeBuilder<T> withFirstChild(T child) {
        List<Tree<T>> children = this.currentChild == null ? this.currentItem.getChildren() : this.currentChild.getChildren();
        Tree<T> treeChild = new Tree<>(child);
        children.add(treeChild);
        if (this.currentChild != null) {
            this.currentItem = this.currentChild;
        }
        this.currentChild = treeChild;
        return this;
    }

    public TreeBuilder<T> withNextChild(T child) {
        List<Tree<T>> children = this.currentItem.getChildren();
        Tree<T> treeChild = new Tree<>(child);
        children.add(treeChild);
        this.currentChild = treeChild;
        return this;
    }

    public TreeBuilder<T> withStatus(Status status) {
        if (this.currentChild != null) {
            this.currentChild.getData().setStatus(status);
        } else {
            this.currentItem.getData().setStatus(status);
        }
        return this;
    }

    public Tree<T> build() {
        return root;
    }
}
