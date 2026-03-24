package com.brutos.tool.entity;

public abstract class AbstractEntity {
    private Long id = null;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
