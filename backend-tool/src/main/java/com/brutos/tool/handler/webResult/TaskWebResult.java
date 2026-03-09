package com.brutos.tool.handler.webResult;

import com.brutos.tool.entity.State;
import com.brutos.tool.entity.TimeIndicator;

import java.util.Objects;

public class TaskWebResult extends AbstractWebResultEntity {
    private String what = "";
    private String when = "";
    // A faire dans la journée, dans la semaine, dans le mois, dans l'année du jour indiqué
    private TimeIndicator goal = TimeIndicator.DAY;
    private State state = State.TODO;

    public TaskWebResult() {
        super();
    }

    public TaskWebResult(String what, String when) {
        super();
        this.what = what;
        this.when = when;
    }

    public TaskWebResult(Long id, String what, String when, TimeIndicator goal, State state) {
        super();
        super.setId(id);
        this.what = what;
        this.when = when;
        this.goal = goal;
        this.state = state;
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

    public TimeIndicator getGoal() {
        return goal;
    }

    public void setGoal(TimeIndicator goal) {
        this.goal = goal;
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

        TaskWebResult that = (TaskWebResult) o;
        return Objects.equals(what, that.what) && Objects.equals(when, that.when) && goal == that.goal && state == that.state;
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(what);
        result = 31 * result + Objects.hashCode(when);
        result = 31 * result + Objects.hashCode(goal);
        result = 31 * result + Objects.hashCode(state);
        return result;
    }

    @Override
    public String toString() {
        return "TaskWebResult{" +
                "what='" + what + '\'' +
                ", when='" + when + '\'' +
                ", goal=" + goal +
                ", state=" + state +
                "} " + super.toString();
    }
}
