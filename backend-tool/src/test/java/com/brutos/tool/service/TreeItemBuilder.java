package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;

import java.util.ArrayList;
import java.util.List;

public class TreeItemBuilder {

    private Item currentItem;
    private Item currentChild;
    private List<Item> items = new ArrayList<>();

    public TreeItemBuilder() {
    }

    public TreeItemBuilder withRootItem(Long id, String title, String text, State state) {
        this.currentItem = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(-1L).build();
        this.items.add(this.currentItem);
        return this;
    }

    public TreeItemBuilder withFirstChild(Long id, String title, String text, State state) {
        List<Item> children = this.currentChild == null ? this.currentItem.getChildren() : this.currentChild.getChildren();
        Item child = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(currentItem.getParentId()).build();
        Item lastChild = children.isEmpty() ? null : children.getLast();
        if (lastChild != null) {
            lastChild.setNextId(child.getId());
        }
        children.add(child);
        if (this.currentChild != null) {
            this.currentItem = this.currentChild;
        }
        this.currentChild = child;
        return this;
    }

    public TreeItemBuilder withNextChild(Long id, String title, String text, State state) {
        List<Item> children = this.currentItem.getChildren();
        Item child = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(currentItem.getParentId()).build();
        Item lastChild = children.isEmpty() ? null : children.getLast();
        if (lastChild != null) {
            lastChild.setNextId(child.getId());
        }
        children.add(child);
        this.currentChild = child;
        return this;
    }

    public TreeItemBuilder withNextRootItem(Long id, String title, String text, State state) {
        this.currentItem = new ItemBuilder().withId(id).withTitle(title).withText(text).withState(state)
                .withParentId(-1L).build();
        this.items.add(this.currentItem);
        this.currentChild = null;
        return this;
    }

    public List<Item> build() {
        return items;
    }
}
