package com.brutos.tool.mapper;

import com.brutos.tool.entity.AbstractEntity;
import com.brutos.tool.handler.webResult.AbstractWebResultEntity;
import com.brutos.tool.model.AbstractModel;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface Mapper<Entity extends AbstractEntity, Model extends AbstractModel, WebResult extends AbstractWebResultEntity> {
    WebResult toWebResult(Entity entity);

    List<WebResult> toWebResult(List<Entity> entities);

    Model toModel(Entity entity);

    List<Model> toModel(List<Entity> entities);

    Entity toEntity(Model model);

    List<Entity> toEntity(List<Model> models);
}
