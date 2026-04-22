package com.brutos.tool.service;

import com.brutos.tool.entity.CRUDMode;
import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;

import java.util.ArrayList;
import java.util.List;

public class ItemBuilder {
    private Long id;
    private String title = "";
    private String text = "";
    private State state = State.TODO;
    private Long parentId;
    private CRUDMode crudMode;
    private List<Item> children = new ArrayList<>();

    public ItemBuilder() {
    }

    public ItemBuilder withId(Long id) {
        this.id = id;
        if (id == null) {
            this.crudMode = CRUDMode.CREATE;
        }
        return this;
    }

    public ItemBuilder withTitle(String title) {
        this.title = title;
        return this;
    }

    public ItemBuilder withText(String text) {
        this.text = text;
        return this;
    }

    public ItemBuilder withState(State state) {
        this.state = state;
        return this;
    }

    public ItemBuilder withCrudMode(CRUDMode crudMode) {
        this.crudMode = crudMode;
        return this;
    }

    public ItemBuilder withParentId(Long parentId) {
        this.parentId = parentId;
        return this;
    }

    public ItemBuilder withChildren(List<Item> children) {
        this.children = children != null ? new ArrayList<>(children) : new ArrayList<>();
        return this;
    }

    public ItemBuilder withChild(Item child) {
        this.children.add(child);
        return this;
    }

    public ItemBuilder withChildren(Item... children) {
        this.children.addAll(List.of(children));
        return this;
    }

    public Item build() {
        Item item = new Item();
        if (id != null) {
            item.setId(id);
        }
        item.setTitle(title);
        item.setText(text);
        item.setState(state);
        item.setParentId(parentId);
        item.setCRUDMode(crudMode);
        item.setChildren(children);
        return item;
    }
}
