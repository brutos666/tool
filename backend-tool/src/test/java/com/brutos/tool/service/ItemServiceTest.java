package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
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
public class ItemServiceTest {
    public static final String TITLE = "Titre";
    public static final String TEXT = "Truc à faire";

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemMapper itemMapper;

    private ItemService itemService;

    @BeforeEach
    public void setUp() {
        itemService = new ItemService(itemRepository, itemMapper);
    }

    @Test
    void shouldSaveItem() {
        // Given
        ItemModel savedItem = new ItemModel();
        savedItem.setId(1L);
        savedItem.setTitle(TITLE);
        savedItem.setText(TEXT);
        savedItem.setState(State.TODO.name());
        when(itemRepository.save(any())).thenReturn(savedItem);

        // When
        Item actual = itemService.save(new Item(TITLE, TEXT));

        // Then
        assertNotNull(actual.getId());
        assertEquals(TITLE, actual.getTitle());
        assertEquals(TEXT, actual.getText());
    }
}
