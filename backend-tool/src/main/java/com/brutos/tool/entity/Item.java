package com.brutos.tool.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Item implements TreeEntity {
    private Long id = null;
    private String title = "";
    private String text = "";
    private State state = State.TODO;
    private Long parentId = -1L;
    private List<Item> children = new ArrayList<>();
    private Status status = Status.OK;
    private CRUDMode mode = CRUDMode.READ;

    public Item() {
    }

    public Item(Long id) {
        this.id = id;
    }

    public Item(String title, String text) {
        this.title = title;
        this.text = text;
    }

    public Item(Long id, String title, String text, State state, Long parentId) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.state = state;
        this.parentId = parentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<Item> getChildren() {
        return children;
    }

    public void setChildren(List<Item> children) {
        this.children = children;
    }

    public Item getChild(int index) {
        return children.get(index);
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public CRUDMode getCRUDMode() {
        return mode;
    }

    public void setCRUDMode(CRUDMode CRUDMode) {
        this.mode = CRUDMode;
    }

    @Override
    public String toString() {
        return "Item{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state=" + state +
                ", parentId=" + parentId +
                ", children=" + children +
                ", status=" + status +
                ", mode=" + mode +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Item item = (Item) o;
        return Objects.equals(id, item.id) && Objects.equals(title, item.title) && Objects.equals(text, item.text) && state == item.state && Objects.equals(parentId, item.parentId) && Objects.equals(children, item.children) && status == item.status && mode == item.mode;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(id);
        result = 31 * result + Objects.hashCode(title);
        result = 31 * result + Objects.hashCode(text);
        result = 31 * result + Objects.hashCode(state);
        result = 31 * result + Objects.hashCode(parentId);
        result = 31 * result + Objects.hashCode(children);
        result = 31 * result + Objects.hashCode(status);
        result = 31 * result + Objects.hashCode(mode);
        return result;
    }
}
