package com.brutos.tool.entity;

public interface TreeEntity {
    Long getParentId();

    void setParentId(Long parentId);

    Long getId();

    void setId(Long id);

    Status getStatus();

    void setStatus(Status status);
}
