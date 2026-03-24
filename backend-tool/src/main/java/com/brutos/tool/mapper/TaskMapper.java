package com.brutos.tool.mapper;

import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Task;
import com.brutos.tool.entity.TimeIndicator;
import com.brutos.tool.exception.InvalidModelValueException;
import com.brutos.tool.handler.webResult.TaskWebResult;
import com.brutos.tool.model.TaskModel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class TaskMapper implements Mapper<Task, TaskModel, TaskWebResult> {
    @Override
    public TaskWebResult toWebResult(Task task) {
        return new TaskWebResult(task.getId(), task.getWhat(), task.getWhen(), task.getDelay(), task.getState());
    }

    @Override
    public Task toEntity(TaskWebResult webResult) {
        Task task = new Task();
        task.setId(webResult.getId());
        task.setWhat(webResult.getWhat());
        task.setWhen(webResult.getWhen());
        task.setDelay(webResult.getDelay());
        task.setState(webResult.getState());
        return task;
    }

    @Override
    public List<TaskWebResult> toWebResult(List<Task> tasks) {
        return tasks.stream().map(this::toWebResult).toList();
    }

    @Override
    public TaskModel toModel(Task task) {
        TaskModel taskModel = new TaskModel();
        taskModel.setId(task.getId());
        taskModel.setWhat(task.getWhat());
        taskModel.setWhen(task.getWhen());
        taskModel.setDelay(task.getDelay().name());
        taskModel.setState(task.getState().getModelValue());
        return taskModel;
    }

    @Override
    public List<TaskModel> toModel(List<Task> tasks) {
        return tasks.stream().map(this::toModel).toList();
    }

    @Override
    public Task toEntity(TaskModel taskModel) {
        Task task = new Task();
        task.setId(taskModel.getId());
        task.setWhat(taskModel.getWhat());
        task.setWhen(taskModel.getWhen());
        task.setDelay(TimeIndicator.valueOf(taskModel.getDelay()));
        Optional<State> optionalState = State.convertModelToEnum(taskModel.getState());
        optionalState.ifPresentOrElse(task::setState, () -> {
            throw new InvalidModelValueException("state (État de la tâche)", String.valueOf(taskModel.getState()), "T, I, D");
        });
        return task;
    }

    @Override
    public List<Task> toEntity(Iterable<TaskModel> taskModels) {
        List<Task> tasks = new ArrayList();
        taskModels.forEach(taskModel -> tasks.add(this.toEntity(taskModel)));
        return tasks;
    }

}
