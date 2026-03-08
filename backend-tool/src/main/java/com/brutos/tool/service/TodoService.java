package com.brutos.tool.service;

import com.brutos.tool.entity.Todo;
import org.springframework.stereotype.Service;

@Service
public class TodoService {

    public static final String NOTHING_TO_DO = "Nothing to do";

    public Todo giveMeNothingTodo(String when) {
        return new Todo(NOTHING_TO_DO, when);
    }

}
