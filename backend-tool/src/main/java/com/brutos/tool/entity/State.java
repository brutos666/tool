package com.brutos.tool.entity;

public enum State {
    TODO, IN_PROGRESS, DONE;

    public boolean isDone() {
        return this == DONE;
    }

    public boolean isInProgress() {
        return this == IN_PROGRESS;
    }

    public boolean isTodo() {
        return this == TODO;
    }
}
