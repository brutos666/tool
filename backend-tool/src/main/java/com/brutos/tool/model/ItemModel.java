package com.brutos.tool.model;

import com.brutos.tool.entity.ChainEntity;
import com.opencsv.bean.CsvBindByName;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.Objects;

@Table(name = "item")
public class ItemModel implements ChainEntity {
    @Id
    @CsvBindByName(column = "id")
    private Long id = null;
    @CsvBindByName(column = "title")
    private String title;
    @CsvBindByName(column = "text")
    private String text;
    @CsvBindByName(column = "state")
    private String state;
    @CsvBindByName(column = "parentId")
    private Long parentId;
    @CsvBindByName(column = "nextId")
    private Long nextId;

    public ItemModel() {
    }

    public ItemModel(Long id, String title, String text, String state, Long parentId, Long nextId) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.state = state;
        this.parentId = parentId;
        this.nextId = nextId;
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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        ItemModel itemModel = (ItemModel) o;
        return Objects.equals(id, itemModel.id) && Objects.equals(title, itemModel.title) && Objects.equals(text, itemModel.text) && Objects.equals(state, itemModel.state) && Objects.equals(parentId, itemModel.parentId) && Objects.equals(nextId, itemModel.nextId);
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(id);
        result = 31 * result + Objects.hashCode(title);
        result = 31 * result + Objects.hashCode(text);
        result = 31 * result + Objects.hashCode(state);
        result = 31 * result + Objects.hashCode(parentId);
        result = 31 * result + Objects.hashCode(nextId);
        return result;
    }

    @Override
    public String toString() {
        return "ItemModel{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state='" + state + '\'' +
                ", parentId=" + parentId +
                ", nextId=" + nextId +
                '}';
    }
}
