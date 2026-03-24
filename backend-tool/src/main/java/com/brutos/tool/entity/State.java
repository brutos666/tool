package com.brutos.tool.entity;

import java.util.Optional;

public enum State {
    TODO('T'), IN_PROGRESS('I'), DONE('D');

    final char modelValue;

    State(char modelValue) {
        this.modelValue = modelValue;
    }

    public static Optional<State> convertModelToEnum(char modelValue) {
        for (State state : State.values()) {
            if (state.getModelValue() == modelValue) {
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

    public char getModelValue() {
        return modelValue;
    }
}
