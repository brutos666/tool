package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Tree;

import java.util.ArrayList;
import java.util.List;

public class TreeItemBuilder {

    private final List<Tree<Item>> items = new ArrayList<>();
    private Tree<Item> currentItem;
    private Tree<Item> currentChild;

    public TreeItemBuilder() {
    }

    public TreeItemBuilder withRootItem(Long id, String title, String text, State state) {
        Item item = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(-1L).build();
        this.currentItem = new Tree<>(item);
        this.items.add(this.currentItem);
        return this;
    }

    public TreeItemBuilder withFirstChild(Long id, String title, String text, State state) {
        List<Tree<Item>> children = this.currentChild == null ? this.currentItem.getChildren() : this.currentChild.getChildren();
        Item child = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(currentItem.getData().getParentId()).build();
        Tree<Item> treeChild = new Tree<>(child);
        Tree<Item> lastChild = children.isEmpty() ? null : children.getLast();
        if (lastChild != null) {
            lastChild.getData().setNextId(child.getId());
        }
        children.add(treeChild);
        if (this.currentChild != null) {
            this.currentItem = this.currentChild;
        }
        this.currentChild = treeChild;
        return this;
    }

    public TreeItemBuilder withNextChild(Long id, String title, String text, State state) {
        List<Tree<Item>> children = this.currentItem.getChildren();
        Item child = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(currentItem.getData().getParentId()).build();
        Tree<Item> treeChild = new Tree<>(child);
        Tree<Item> lastChild = children.isEmpty() ? null : children.getLast();
        if (lastChild != null) {
            lastChild.getData().setNextId(child.getId());
        }
        children.add(treeChild);
        this.currentChild = treeChild;
        return this;
    }

    public TreeItemBuilder withNextRootItem(Long id, String title, String text, State state) {
        Item item = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(-1L).build();
        this.currentItem = new Tree<>(item);
        this.items.add(this.currentItem);
        this.currentChild = null;
        return this;
    }

    public List<Tree<Item>> build() {
        return items;
    }
}
