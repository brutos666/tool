package com.brutos.tool.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Item extends AbstractEntity {
    private String title = "";
    private String text = "";
    private State state = State.TODO;
    private Long parentId;
    private Long nextId;
    private List<Item> children = new ArrayList<>();

    public Item() {
    }

    public Item(String title, String text) {
        this.title = title;
        this.text = text;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public Long getParentId() {
        return parentId == null ? -1L : parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Long getNextId() {
        return nextId;
    }

    public void setNextId(Long nextId) {
        this.nextId = nextId;
    }

    public List<Item> getChildren() {
        return children;
    }

    public void setChildren(List<Item> children) {
        this.children = children;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Item item = (Item) o;
        return Objects.equals(title, item.title) && Objects.equals(text, item.text) && state == item.state && Objects.equals(parentId, item.parentId) && Objects.equals(nextId, item.nextId) && Objects.equals(children, item.children);
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(title);
        result = 31 * result + Objects.hashCode(text);
        result = 31 * result + Objects.hashCode(state);
        result = 31 * result + Objects.hashCode(parentId);
        result = 31 * result + Objects.hashCode(nextId);
        result = 31 * result + Objects.hashCode(children);
        return result;
    }

    @Override
    public String toString() {
        return "Item{" +
                "title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state=" + state +
                ", parentId=" + parentId +
                ", nextId=" + nextId +
                ", children=" + children +
                "} " + super.toString();
    }
}
