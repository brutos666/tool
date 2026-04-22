package com.brutos.tool.mapper;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.exception.InvalidModelValueException;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.model.ItemModel;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ItemMapperTest {
    public static final String TODO_TITLE = "Titre";
    public static final String TODO_TEXT = "Truc à faire";
    public static final String INVALID_STATE = "x#R*";
    public static final Long PARENT_ID = 1L;
    public static final Long CHILD_ID = 2L;
    public static final Long NEXT_ID = 12L;
    public static final String TITLE1 = "Titre 1";
    public static final String TITLE2 = "Titre 2";
    public static final String TITLE3 = "Titre 3";
    public static final String TITLE4 = "Titre 4";
    public static final String TEXT1 = "Texte 1";
    public static final String TEXT2 = "Texte 2";
    public static final String TEXT3 = "Texte 3";
    public static final String TEXT4 = "Texte 4";

    @Test
    void givenItemModel_whenToEntity_thenItem() {
        // Given
        ItemModel itemModel = new ItemModel();
        itemModel.setId(CHILD_ID);
        itemModel.setTitle(TODO_TITLE);
        itemModel.setText(TODO_TEXT);
        itemModel.setState(State.TODO.name());
        itemModel.setParentId(PARENT_ID);
        itemModel.setNextId(NEXT_ID);

        // When
        Item actual = ItemMapper.toEntity(itemModel);

        // Then
        assertEquals(CHILD_ID, actual.getId());
        assertEquals(TODO_TITLE, actual.getTitle());
        assertEquals(TODO_TEXT, actual.getText());
        assertEquals(State.TODO, actual.getState());
        assertEquals(PARENT_ID, actual.getParentId());
    }

    @Test
    void givenItemModelWithInvalidState_whenToEntity_throwsException() {
        // Given
        ItemModel itemModel = new ItemModel();
        itemModel.setId(CHILD_ID);
        itemModel.setTitle(TODO_TITLE);
        itemModel.setText(TODO_TEXT);
        itemModel.setState(INVALID_STATE);
        itemModel.setParentId(PARENT_ID);
        itemModel.setNextId(NEXT_ID);

        // When/Then
        assertThrows(InvalidModelValueException.class, () -> {
            ItemMapper.toEntity(itemModel);
        });
    }

    @Test
    void givenItemWebResult_whenToTreeEntity_thenTreeItemWithGoodNextId() {
        // Given
        ItemWebResult itemWebResult = new ItemWebResult();
        itemWebResult.setId(1L);
        itemWebResult.setTitle(TITLE1);
        itemWebResult.setText(TEXT1);
        itemWebResult.setState(State.TODO);
        itemWebResult.setParentId(PARENT_ID);
        itemWebResult.setChildren(List.of(new ItemWebResult(2L, TITLE2, TEXT2, State.TODO),
                new ItemWebResult(3L, TITLE3, TEXT3, State.TODO),
                new ItemWebResult(4L, TITLE4, TEXT4, State.TODO)));

        // When
        Tree<Item> actual = ItemMapper.toTreeEntity(itemWebResult);
        Item actualData = actual.getData();
        Item actualChild1 = actual.getChild(0).getData();
        Item actualChild2 = actual.getChild(1).getData();
        Item actualChild3 = actual.getChild(2).getData();

        // Then
        assertEquals(1L, actualData.getId());
        assertEquals(TITLE1, actualData.getTitle());
        assertEquals(TEXT1, actualData.getText());
        assertEquals(State.TODO, actualData.getState());
        assertEquals(PARENT_ID, actualData.getParentId());
        assertEquals(2L, actualChild1.getId());
        assertEquals(TITLE2, actualChild1.getTitle());
        assertEquals(3L, actualChild2.getId());
        assertEquals(TITLE3, actualChild2.getTitle());
        assertEquals(4L, actualChild3.getId());
        assertEquals(TITLE4, actualChild3.getTitle());
    }

}