package com.brutos.tool.model;

import org.springframework.data.annotation.Id;

public class AbstractModel {
    @Id
    private Long id = null;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
