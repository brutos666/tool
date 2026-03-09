package com.brutos.tool.model;

import org.springframework.data.relational.core.mapping.Table;

@Table(name = "task")
public class TaskModel extends AbstractModel {
    private String what;
    private String when;
    private String goal;
    private String state;

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

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
