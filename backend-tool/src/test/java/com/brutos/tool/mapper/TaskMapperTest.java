package com.brutos.tool.mapper;

import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Task;
import com.brutos.tool.entity.TimeIndicator;
import com.brutos.tool.exception.InvalidModelValueException;
import com.brutos.tool.model.TaskModel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TaskMapperTest {
    public static final String TODO_TEXT = "Tâche à faire";
    public static final String DATE = "20230101";
    public static final char INVALID_STATE = 'X';
    final private TaskMapper taskMapper = new TaskMapper();

    @Test
    void givenTaskModel_whenToEntity_thenTask() {
        // Given
        TaskModel taskModel = new TaskModel();
        taskModel.setId(1L);
        taskModel.setWhat(TODO_TEXT);
        taskModel.setWhen(DATE);
        taskModel.setDelay(TimeIndicator.DAY.name());
        taskModel.setState(State.TODO.getModelValue());

        // When
        Task actual = taskMapper.toEntity(taskModel);

        // Then
        assertEquals(1L, actual.getId());
        assertEquals(TODO_TEXT, actual.getWhat());
        assertEquals(DATE, actual.getWhen());
        assertEquals(TimeIndicator.DAY, actual.getDelay());
        assertEquals(State.TODO, actual.getState());
    }

    @Test
    void givenTaskModelWithInvalidState_whenToEntity_throwsException() {
        // Given
        TaskModel taskModel = new TaskModel();
        taskModel.setId(1L);
        taskModel.setWhat(TODO_TEXT);
        taskModel.setWhen(DATE);
        taskModel.setDelay(TimeIndicator.DAY.name());
        taskModel.setState(INVALID_STATE);

        // When/Then
        assertThrows(InvalidModelValueException.class, () -> {
            taskMapper.toEntity(taskModel);
        });
    }
}