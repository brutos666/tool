package com.brutos.tool.repository;

import com.brutos.tool.model.TaskModel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends CrudRepository<TaskModel, Long> {
    @Override
    <S extends TaskModel> S save(S entity);

    <S extends TaskModel> S findByWhen(String when);
}
