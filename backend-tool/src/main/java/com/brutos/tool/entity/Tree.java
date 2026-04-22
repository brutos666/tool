package com.brutos.tool.entity;

import java.util.ArrayList;
import java.util.List;

public class Tree<I> {
    private I data;
    private List<Tree<I>> children = new ArrayList<>();

    public Tree(I data) {
        this.data = data;
    }

    public I getData() {
        return data;
    }

    public void setData(I data) {
        this.data = data;
    }

    public List<Tree<I>> getChildren() {
        return children;
    }

    public void setChildren(List<Tree<I>> children) {
        this.children = children;
    }

    public Tree<I> getChild(int i) {
        return children.get(i);
    }

    public I getChildData(int i) {
        return children.get(i).getData();
    }

    public Tree<I> addChild(I childData) {
        Tree<I> treeChild = new Tree<>(childData);
        this.getChildren().add(treeChild);
        return treeChild;
    }

    public Tree<I> addChild(Tree<I> child) {
        this.getChildren().add(child);
        return child;
    }
}
