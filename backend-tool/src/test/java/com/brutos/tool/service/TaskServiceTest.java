package com.brutos.tool.service;

import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Task;
import com.brutos.tool.entity.TimeIndicator;
import com.brutos.tool.mapper.TaskMapper;
import com.brutos.tool.model.TaskModel;
import com.brutos.tool.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {
    public static final String TODO_TEXT = "Tâche à faire";
    public static final String DATE = "20230101";
    
    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskMapper taskMapper;

    private TaskService taskService;

    @BeforeEach
    public void setUp() {
        taskService = new TaskService(taskRepository, taskMapper);
    }

    @Test
    void shouldSaveTask() {
        // Given

        TaskModel savedTask = new TaskModel();
        savedTask.setId(1L);
        savedTask.setWhat(TODO_TEXT);
        savedTask.setWhen(DATE);
        savedTask.setGoal(TimeIndicator.DAY.name());
        savedTask.setState(State.TODO.name());
        when(taskRepository.save(any())).thenReturn(savedTask);

        // When
        Task actual = taskService.save(TODO_TEXT, DATE);

        // Then
        assertNotNull(actual.getId());
        assertEquals(TODO_TEXT, actual.getWhat());
        assertEquals(DATE, actual.getWhen());
    }
}
