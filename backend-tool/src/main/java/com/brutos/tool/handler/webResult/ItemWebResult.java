package com.brutos.tool.handler.webResult;

import com.brutos.tool.entity.CRUDMode;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Status;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ItemWebResult extends AbstractWebResultEntity {
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
        return Objects.equals(title, that.title) && Objects.equals(text, that.text) && state == that.state && Objects.equals(parentId, that.parentId) && Objects.equals(nextId, that.nextId) && Objects.equals(children, that.children) && status == that.status && CRUDMode == that.CRUDMode;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(title);
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
                "title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state=" + state +
                ", parentId=" + parentId +
                ", nextId=" + nextId +
                ", children=" + children +
                ", status=" + status +
                ", CRUDMode=" + CRUDMode +
                "} " + super.toString();
    }

}
