package com.brutos.tool.handler.webResult;

import com.brutos.tool.entity.State;

import java.util.Objects;

public class ItemWebResult extends AbstractWebResultEntity {
    private String title = "";
    private String text = "";
    private State state = State.TODO;

    public ItemWebResult() {
        super();
    }

    public ItemWebResult(String title, String text) {
        super();
        this.title = title;
        this.text = text;
    }

    public ItemWebResult(Long id, String title, String text, State state) {
        super();
        super.setId(id);
        this.title = title;
        this.text = text;
        this.state = state;
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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        ItemWebResult that = (ItemWebResult) o;
        return Objects.equals(title, that.title) && Objects.equals(text, that.text) && state == that.state;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(title);
        result = 31 * result + Objects.hashCode(text);
        result = 31 * result + Objects.hashCode(state);
        return result;
    }

    @Override
    public String toString() {
        return "ItemWebResult{" +
                "title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state=" + state +
                "} " + super.toString();
    }
}
