package com.brutos.tool.service;

import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Task;
import com.brutos.tool.entity.TimeIndicator;
import com.brutos.tool.mapper.TaskMapper;
import com.brutos.tool.model.TaskModel;
import com.brutos.tool.repository.TaskRepository;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    public static final String NOTHING_TO_DO = "Nothing to do";

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public Task save(String what, String when) {
        Task task = new Task();
        task.setWhat(what);
        task.setWhen(when);
        task.setGoal(TimeIndicator.DAY);
        task.setState(State.TODO);
        TaskModel taskModel = taskRepository.save(taskMapper.toModel(task));
        return taskMapper.toEntity(taskModel);
    }

    public Task giveMeNothingTask(String when) {
        Task task = new Task();
        task.setWhat(NOTHING_TO_DO);
        task.setWhen(when);
        return task;
    }

    public Task giveMeTask(String what, String when) {
        return new Task(what, when);
    }

}
