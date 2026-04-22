package com.brutos.tool.handler.webResult;

import com.brutos.tool.entity.CRUDMode;
import com.brutos.tool.entity.ChainEntity;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Status;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ItemWebResult implements ChainEntity {
    private Long id;
    private String title = "";
    private String text = "";
    private State state = State.TODO;
    private Long parentId;
    private Long nextId;
    private List<ItemWebResult> children = new ArrayList<>();
    private Status status = Status.OK;
    private CRUDMode CRUDMode;

    public ItemWebResult() {
        super();
    }

    public ItemWebResult(Long id, String title, String text, State state) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.state = state;
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

    public Long getNextId() {
        return nextId;
    }

    public void setNextId(Long nextId) {
        this.nextId = nextId;
    }

    public List<ItemWebResult> getChildren() {
        return children;
    }

    public void setChildren(List<ItemWebResult> children) {
        this.children = children;
    }

    public ItemWebResult getChild(int index) {
        return children.get(index);
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public CRUDMode getCRUDMode() {
        return CRUDMode;
    }

    public void setCRUDMode(CRUDMode CRUDMode) {
        this.CRUDMode = CRUDMode;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        ItemWebResult that = (ItemWebResult) o;
        return Objects.equals(id, that.id) && Objects.equals(title, that.title) && Objects.equals(text, that.text) && state == that.state && Objects.equals(parentId, that.parentId) && Objects.equals(nextId, that.nextId) && Objects.equals(children, that.children) && status == that.status && CRUDMode == that.CRUDMode;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(id);
        result = 31 * result + Objects.hashCode(title);
        result = 31 * result + Objects.hashCode(text);
        result = 31 * result + Objects.hashCode(state);
        result = 31 * result + Objects.hashCode(parentId);
        result = 31 * result + Objects.hashCode(nextId);
        result = 31 * result + Objects.hashCode(children);
        result = 31 * result + Objects.hashCode(status);
        result = 31 * result + Objects.hashCode(CRUDMode);
        return result;
    }

    @Override
    public String toString() {
        return "ItemWebResult{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state=" + state +
                ", parentId=" + parentId +
                ", nextId=" + nextId +
                ", children=" + children +
                ", status=" + status +
                ", CRUDMode=" + CRUDMode +
                '}';
    }

}
