package com.brutos.tool.mapper;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.exception.InvalidModelValueException;
import com.brutos.tool.model.ItemModel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ItemMapperTest {
    public static final String TODO_TITLE = "Titre";
    public static final String TODO_TEXT = "Truc à faire";
    public static final String INVALID_STATE = "x#R*";
    final private ItemMapper itemMapper = new ItemMapper();

    @Test
    void givenItemModel_whenToEntity_thenItem() {
        // Given
        ItemModel itemModel = new ItemModel();
        itemModel.setId(1L);
        itemModel.setTitle(TODO_TITLE);
        itemModel.setText(TODO_TEXT);
        itemModel.setState(State.TODO.name());

        // When
        Item actual = itemMapper.toEntity(itemModel);

        // Then
        assertEquals(1L, actual.getId());
        assertEquals(TODO_TITLE, actual.getTitle());
        assertEquals(TODO_TEXT, actual.getText());
        assertEquals(State.TODO, actual.getState());
    }

    @Test
    void givenItemModelWithInvalidState_whenToEntity_throwsException() {
        // Given
        ItemModel itemModel = new ItemModel();
        itemModel.setId(1L);
        itemModel.setTitle(TODO_TITLE);
        itemModel.setText(TODO_TEXT);
        itemModel.setState(INVALID_STATE);

        // When/Then
        assertThrows(InvalidModelValueException.class, () -> {
            itemMapper.toEntity(itemModel);
        });
    }
}