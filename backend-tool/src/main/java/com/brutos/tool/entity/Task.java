package com.brutos.tool.entity;

import java.util.Objects;

public class Task extends AbstractEntity {
    private String what = "";
    private String when = "";
    // A faire dans la journée, dans la semaine, dans le mois, dans l'année du jour indiqué
    private TimeIndicator delay = TimeIndicator.DAY;
    private State state = State.TODO;

    public Task() {
    }

    public Task(String what, String when) {
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

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public TimeIndicator getDelay() {
        return delay;
    }

    public void setDelay(TimeIndicator delay) {
        this.delay = delay;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Task task = (Task) o;
        return Objects.equals(what, task.what) && Objects.equals(when, task.when) && delay == task.delay && state == task.state;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(what);
        result = 31 * result + Objects.hashCode(when);
        result = 31 * result + Objects.hashCode(delay);
        result = 31 * result + Objects.hashCode(state);
        return result;
    }

    @Override
    public String toString() {
        return "Task{" +
                "what='" + what + '\'' +
                ", when='" + when + '\'' +
                ", delay=" + delay +
                ", state=" + state +
                "} " + super.toString();
    }
}
