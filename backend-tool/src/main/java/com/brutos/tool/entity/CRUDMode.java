package com.brutos.tool.entity;

public enum CRUDMode {
    CREATE,
    READ,
    UPDATE,
    DELETE,
    MOVE;

    public boolean isCreate() {
        return this == CREATE;
    }

    public boolean isUpdate() {
        return this == UPDATE;
    }

    public boolean isDelete() {
        return this == DELETE;
    }

    public boolean isRead() {
        return this == READ;
    }

    public boolean isMove() {
        return this == MOVE;
    }

}
