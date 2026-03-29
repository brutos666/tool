package com.brutos.tool.entity;

import java.util.Objects;

public class Item extends AbstractEntity {
    private String title = "";
    private String text = "";
    private State state = State.TODO;

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Item item = (Item) o;
        return Objects.equals(title, item.title) && Objects.equals(text, item.text) && state == item.state;
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
        return "Item{" +
                "title='" + title + '\'' +
                ", text='" + text + '\'' +
                ", state=" + state +
                "} " + super.toString();
    }
}
