package com.brutos.tool.model;

import org.springframework.data.relational.core.mapping.Table;

@Table(name = "item")
public class ItemModel extends AbstractModel {
    private String title;
    private String text;
    private String state;
    private Long parentId;
    private Long nextId;

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

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Long getParentId() {
        return parentId;
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
}
