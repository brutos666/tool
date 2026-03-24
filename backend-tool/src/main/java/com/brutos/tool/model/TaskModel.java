package com.brutos.tool.model;

import org.springframework.data.relational.core.mapping.Table;

@Table(name = "task")
public class TaskModel extends AbstractModel {
    private String what;
    private String when;
    private String delay;
    private char state;

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

    public String getDelay() {
        return delay;
    }

    public void setDelay(String delay) {
        this.delay = delay;
    }

    public char getState() {
        return state;
    }

    public void setState(char state) {
        this.state = state;
    }
}
