package com.brutos.tool.controller;

import com.brutos.tool.entity.Todo;
import com.brutos.tool.service.DateService;
import com.brutos.tool.service.TodoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class TodoListController {

    private final DateService dateService;

    private final TodoService todoService;

    // @Autowired
    public TodoListController(TodoService todoService, DateService dateService) {
        this.todoService = todoService;
        this.dateService = dateService;
    }

    @GetMapping("/")
    public String home() {
        return "Hello, Spring Boot!";
    }

    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        return String.format("Hello %s!", name);
    }

    @GetMapping("/task")
    public Todo task(@RequestParam(value = "when", defaultValue = "") String when) {
        return this.todoService.giveMeNothingTodo(this.dateService.getToday());
    }

}
