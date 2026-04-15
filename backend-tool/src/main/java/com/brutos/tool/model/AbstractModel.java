package com.brutos.tool.model;

import com.opencsv.bean.CsvBindByName;
import org.springframework.data.annotation.Id;

public class AbstractModel {
    @Id
    @CsvBindByName(column = "id")
    private Long id = null;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "AbstractModel{" +
                "id=" + id +
                '}';
    }
}
