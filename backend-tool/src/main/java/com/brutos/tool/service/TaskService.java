package com.brutos.tool.service;

import com.brutos.tool.entity.Task;
import com.brutos.tool.mapper.TaskMapper;
import com.brutos.tool.model.TaskModel;
import com.brutos.tool.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    public static final String NOTHING_TO_DO = "Nothing to do";

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public Task save(Task task) {
        TaskModel taskModel = taskRepository.save(taskMapper.toModel(task));
        return taskMapper.toEntity(taskModel);
    }

    public Task giveMeNothingTask(String when) {
        Task task = new Task();
        task.setWhat(NOTHING_TO_DO);
        task.setWhen(when);
        return task;
    }

    public List<Task> findAllTasks() {
        return taskMapper.toEntity(taskRepository.findAll());
    }

}
