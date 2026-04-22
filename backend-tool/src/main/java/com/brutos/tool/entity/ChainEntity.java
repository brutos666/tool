package com.brutos.tool.entity;

public interface ChainEntity {
    Long getParentId();

    void setParentId(Long parentId);

    Long getNextId();

    void setNextId(Long nextId);

    Long getId();

    void setId(Long id);
}
