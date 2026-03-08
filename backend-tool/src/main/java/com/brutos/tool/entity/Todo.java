package com.brutos.tool.entity;


import java.util.Objects;

public class Todo {
    String what = "";
    String when = "";
    DatePrecision datePrecision = DatePrecision.DAY;
    State state = State.TODO;

    public Todo(String what, String when) {
        this.what = what;
        this.when = when;
    }

    public String getWhat() {
        return what;
    }

    public void setWhat(String what) {
        this.what = what;
    }

    public String getWhen() {
        return when;
    }

    public void setWhen(String when) {
        this.when = when;
    }

    public boolean isDone() {
        return state.isDone();
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public DatePrecision getDatePrecision() {
        return datePrecision;
    }

    public void setDatePrecision(DatePrecision datePrecision) {
        this.datePrecision = datePrecision;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Todo todo = (Todo) o;
        return Objects.equals(what, todo.what) && Objects.equals(when, todo.when) && datePrecision == todo.datePrecision && state == todo.state;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(what);
        result = 31 * result + Objects.hashCode(when);
        result = 31 * result + datePrecision.hashCode();
        result = 31 * result + state.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Todo{" +
                "what='" + what + '\'' +
                ", when='" + when + '\'' +
                ", datePrecision=" + datePrecision +
                ", state=" + state +
                '}';
    }
}
