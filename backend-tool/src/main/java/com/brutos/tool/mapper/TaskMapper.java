package com.brutos.tool.mapper;

import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Task;
import com.brutos.tool.entity.TimeIndicator;
import com.brutos.tool.handler.webResult.TaskWebResult;
import com.brutos.tool.model.TaskModel;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskMapper implements Mapper<Task, TaskModel, TaskWebResult> {
    @Override
    public TaskWebResult toWebResult(Task task) {
        return new TaskWebResult(task.getId(), task.getWhat(), task.getWhen(), task.getGoal(), task.getState());
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
        taskModel.setGoal(task.getGoal().name());
        taskModel.setState(task.getState().name());
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
        task.setGoal(TimeIndicator.valueOf(taskModel.getGoal()));
        task.setState(State.valueOf(taskModel.getState()));
        return task;
    }

    @Override
    public List<Task> toEntity(List<TaskModel> taskModels) {
        return taskModels.stream().map(this::toEntity).toList();
    }
}
