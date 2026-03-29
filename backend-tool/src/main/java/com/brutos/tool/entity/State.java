package com.brutos.tool.entity;

import java.util.Optional;

public enum State {
    TODO, IN_PROGRESS, DONE;

    public static Optional<State> convertStringToEnum(String value) {
        for (State state : State.values()) {
            if (state.name().equals(value)) {
                return Optional.of(state);
            }
        }
        return Optional.empty();
    }

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
