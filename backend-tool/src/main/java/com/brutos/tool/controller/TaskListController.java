package com.brutos.tool.controller;

import com.brutos.tool.entity.Task;
import com.brutos.tool.handler.webResult.TaskWebResult;
import com.brutos.tool.mapper.TaskMapper;
import com.brutos.tool.service.DateService;
import com.brutos.tool.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/task")
public class TaskListController {

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
        String today = this.dateService.getToday();
        List<Task> tasks = new ArrayList<>(2);
        tasks.add(this.taskService.giveMeTask("Faire à manger", today));
        tasks.add(this.taskService.giveMeTask("Faire du sport", today));
        return this.taskMapper.toWebResult(tasks);
    }

    @PostMapping("/save")
    public TaskWebResult saveTask(@RequestParam(value = "what", defaultValue = "") String what) {
        String today = this.dateService.getToday();
        Task task = this.taskService.save(what, today);
        return this.taskMapper.toWebResult(task);
    }

}
