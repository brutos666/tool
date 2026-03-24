package com.brutos.tool.controller;

import com.brutos.tool.entity.Task;
import com.brutos.tool.handler.webResult.TaskWebResult;
import com.brutos.tool.mapper.TaskMapper;
import com.brutos.tool.service.DateService;
import com.brutos.tool.service.TaskService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task")
public class TaskListController {
    private static final Logger logger = LogManager.getLogger(TaskListController.class);

    private final DateService dateService;
    private final TaskService taskService;
    private final TaskMapper taskMapper;

    // @Autowired
    public TaskListController(TaskService taskService, DateService dateService, TaskMapper taskMapper) {
        this.taskService = taskService;
        this.dateService = dateService;
        this.taskMapper = taskMapper;
    }

    @GetMapping("/today")
    public TaskWebResult getTodayTask(@RequestParam(value = "when", defaultValue = "") String when) {
        Task task = this.taskService.giveMeNothingTask(this.dateService.getToday());
        return this.taskMapper.toWebResult(task);
    }

    @GetMapping("/taskTodo")
    public List<TaskWebResult> getTaskToDo() {
        List<Task> tasks = this.taskService.findAllTasks();
        return this.taskMapper.toWebResult(tasks);
    }

    @PostMapping("/save")
    public TaskWebResult saveTask(@RequestBody TaskWebResult taskWebRequest) {
        this.dateService.controlDate(taskWebRequest.getWhen());
        Task task = this.taskService.save(this.taskMapper.toEntity(taskWebRequest));
        return this.taskMapper.toWebResult(task);
    }

}
