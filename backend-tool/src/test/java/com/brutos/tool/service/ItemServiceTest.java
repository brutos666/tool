package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Status;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ItemServiceTest {
    public static final String TITLE = "Titre";
    public static final String TITLE1 = "Titre 1";
    public static final String TITLE2 = "Titre 2";
    public static final String TITLE3 = "Titre 3";
    public static final String TITLE4 = "Titre 4";
    public static final String TITLE5 = "Titre 5";
    public static final String TEXT = "Truc à faire";
    public static final String TEXT1 = "Texte 1";
    public static final String TEXT2 = "Texte 2";
    public static final String TEXT3 = "Texte 3";
    public static final String TEXT4 = "Texte 4";
    public static final String TEXT5 = "Texte 5";

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemMapper itemMapper;

    private ItemService itemService;

    private Long nextId = 1L;

    @BeforeEach
    public void setUp() {
        itemService = new ItemService(itemRepository, itemMapper);

    }

    private void mockSave() {
        // Mock de la sauvegarde d'un nouvel item
        when(itemRepository.save(any(ItemModel.class))).thenAnswer(invocation -> {
            ItemModel input = invocation.getArgument(0);
            ItemModel copy = new ItemModel();
            // Ne générer un nouvel ID que si l'objet en entrée a un ID null
            if (input.getId() == null) {
                copy.setId(nextId++);
            } else {
                copy.setId(input.getId());
            }
            copy.setTitle(input.getTitle());
            copy.setText(input.getText());
            copy.setState(input.getState());
            copy.setParentId(input.getParentId());
            copy.setNextId(input.getNextId());
            return copy;
        });
    }

    @Test
    void shouldSaveItem() {
        // Given
        ItemModel savedItem = new ItemModel();
        savedItem.setId(1L);
        savedItem.setTitle(TITLE);
        savedItem.setText(TEXT);
        savedItem.setState(State.TODO.name());
        mockSave();

        // When
        Item actual = itemService.save(new Item(TITLE, TEXT));

        // Then
        assertNotNull(actual.getId());
        assertEquals(TITLE, actual.getTitle());
        assertEquals(TEXT, actual.getText());
    }

    @Test
    void sortItems_shouldReturnList_shouldAllStatusOk_whenNoChildrenWithNextIdsCorrect() {
        List<Item> flatItems = List.of(
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 2L),
                new Item(2L, TITLE2, TEXT2, State.TODO, -1L, null));

        List<Item> actual = itemService.transformToTree(flatItems);

        assertEquals(2, actual.size());
        assertEquals(TITLE1, actual.get(0).getTitle());
        assertEquals(TITLE2, actual.get(1).getTitle());
        assertEquals(Status.OK, actual.get(0).getStatus());
        assertEquals(Status.OK, actual.get(1).getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldAllStatusOk_whenOneChildrenWithNextIdsCorrect() {
        List<Item> flatItems = List.of(
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null),
                new Item(2L, TITLE2, TEXT2, State.TODO, 1L, null));

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent = actual.getFirst();
        Item actualChild = actualParent.getChild(0);

        assertEquals(1, actual.size());
        assertEquals(TITLE1, actualParent.getTitle());
        assertEquals(TITLE2, actualChild.getTitle());
        assertEquals(1, actualParent.getChildren().size());
        assertEquals(Status.OK, actualParent.getStatus());
        assertEquals(Status.OK, actualChild.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldAllStatusOk_whenTreeWithNextIdsCorrect() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 4L);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 3L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, null);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent1 = actual.getFirst();
        Item actualParent2 = actual.get(1);
        Item actualChild1Parent1 = actualParent1.getChild(0);
        Item actualChild2Parent1 = actualParent1.getChild(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(2, actualParent1.getChildren().size());
        assertEquals(0, actualParent2.getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.OK, actualParent2.getStatus());
        assertEquals(Status.OK, actualChild1Parent1.getStatus());
        assertEquals(Status.OK, actualChild2Parent1.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldHaveOrphanStatus_whenTreeWithNextIdsNull() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, null);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, null);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent1 = actual.getFirst();
        Item actualParent2 = actual.get(1);
        Item actualChild1Parent1 = actualParent1.getChild(0);
        Item actualChild2Parent1 = actualParent1.getChild(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(2, actualParent1.getChildren().size());
        assertEquals(0, actualParent2.getChildren().size());
        assertEquals(Status.ORPHAN, actualParent1.getStatus());
        assertEquals(Status.ORPHAN, actualParent2.getStatus());
        assertEquals(Status.ORPHAN, actualChild1Parent1.getStatus());
        assertEquals(Status.ORPHAN, actualChild2Parent1.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldHaveNextNotFoundStatus_whenTreeWithNextIdsNotFound() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 4L);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, 5L);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 3L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, 10L);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent1 = actual.getFirst();
        Item actualParent2 = actual.get(1);
        Item actualChild1Parent1 = actualParent1.getChild(0);
        Item actualChild2Parent1 = actualParent1.getChild(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(2, actualParent1.getChildren().size());
        assertEquals(0, actualParent2.getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.NEXT_NOT_FOUND, actualParent2.getStatus());
        assertEquals(Status.OK, actualChild1Parent1.getStatus());
        assertEquals(Status.NEXT_NOT_FOUND, actualChild2Parent1.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldHaveLoopStatus_whenChildrenLoop() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 3L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, 4L);
        Item child3Parent1 = new Item(4L, TITLE4, TEXT4, State.TODO, 1L, 2L);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, child3Parent1);

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent1 = actual.getFirst();
        Item actualChild1Parent1 = actualParent1.getChild(0);
        Item actualChild2Parent1 = actualParent1.getChild(1);
        Item actualChild3Parent1 = actualParent1.getChild(2);

        assertEquals(1, actual.size());
        assertEquals(3, actualParent1.getChildren().size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(toStringValues(actualChild3Parent1), toStringValues(actualChild3Parent1));
        assertEquals(3, actualParent1.getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.OK, actualChild1Parent1.getStatus());
        assertEquals(Status.OK, actualChild2Parent1.getStatus());
        assertEquals(Status.LOOP, actualChild3Parent1.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldHaveLoopStatus_whenTwoChildrenLoop() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 2L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, 4L);
        Item child3Parent1 = new Item(4L, TITLE4, TEXT4, State.TODO, 1L, 3L);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, child3Parent1);

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent1 = actual.getFirst();
        Item actualChild1Parent1 = actualParent1.getChild(0);
        Item actualChild2Parent1 = actualParent1.getChild(1);
        Item actualChild3Parent1 = actualParent1.getChild(2);

        assertEquals(1, actual.size());
        assertEquals(3, actualParent1.getChildren().size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(toStringValues(actualChild3Parent1), toStringValues(actualChild3Parent1));
        assertEquals(3, actualParent1.getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.LOOP, actualChild1Parent1.getStatus());
        assertEquals(Status.OK, actualChild2Parent1.getStatus());
        assertEquals(Status.LOOP, actualChild3Parent1.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldHaveOrphanNextNotFoundStatus_whenTreeWithTotalOrphan() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, 5L);
        Item child1parent2 = new Item(2L, TITLE2, TEXT2, State.TODO, 4L, 3L);
        Item child2parent2 = new Item(3L, TITLE3, TEXT3, State.TODO, 4L, 10L);
        List<Item> flatItems = List.of(parent1, child2parent2, child1parent2, parent2);

        List<Item> actual = itemService.transformToTree(flatItems);
        Item actualParent1 = actual.getFirst();
        Item actualParent2 = actual.get(1);
        Item actualChild1Parent2 = actualParent2.getChild(0);
        Item actualChild2Parent2 = actualParent2.getChild(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent2), toStringValues(actualChild1Parent2));
        assertEquals(toStringValues(actualChild2Parent2), toStringValues(actualChild2Parent2));
        assertEquals(0, actualParent1.getChildren().size());
        assertEquals(2, actualParent2.getChildren().size());
        assertEquals(Status.ORPHAN, actualParent1.getStatus());
        assertEquals(Status.TOTAL_ORPHAN, actualParent2.getStatus());
        assertEquals(Status.OK, actualChild1Parent2.getStatus());
        assertEquals(Status.NEXT_NOT_FOUND, actualChild2Parent2.getStatus());
    }

    @Test
    void sortItems_shouldReturnTree_shouldAllStatusOk_whenNextIdsCorrect() {
        List<Item> flatItems = List.of(
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 2L),
                new Item(2L, TITLE2, TEXT2, State.TODO, -1L, null));

        List<Item> actual = itemService.transformToTree(flatItems);

        assertEquals(2, actual.size());
        assertEquals(TITLE1, actual.get(0).getTitle());
        assertEquals(TITLE2, actual.get(1).getTitle());
    }

    @Test
    void saveTreeItems_shouldUpdatePreviousNextId_whenExistPrevious() {
        // Given
        ItemModel lastItem = new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, null);
        when(this.itemRepository.findFirstByParentIdAndNextIdIsNull(-1L)).thenReturn(Optional.of(lastItem));
        List<Item> itemsToSave = List.of(new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null));
        nextId = 3L;
        mockSave();

        // When
        List<Item> actual = itemService.saveTreeItems(itemsToSave);

        // Then
        // Appel à sauvegarder une fois pour le précédent et 1 fois pour le nouveau
        verify(itemRepository, times(2)).save(any());
        // Vérifier les valeurs
        assertEquals(toStringValues(lastItem), toStringValues(actual.getFirst()));
        assertEquals(toStringValues(itemsToSave.getFirst()), toStringValues(actual.get(1)));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actual.getFirst().getId());
        assertTrue(actual.get(1).getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actual.get(1).getId(), actual.getFirst().getNextId());
        assertNull(actual.get(1).getNextId());
        // Vérifier les parents (tous -1L)
        assertEquals(-1L, actual.getFirst().getParentId());
        assertEquals(-1L, actual.get(1).getParentId());
    }

    @Test
    void saveTreeItems_shouldKeepTree_whenExistChildren() {
        // Given
        ItemModel lastItem = new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, null);
        when(this.itemRepository.findFirstByParentIdAndNextIdIsNull(-1L)).thenReturn(Optional.of(lastItem));
        List<Item> itemsToSave = new TreeItemBuilder().withRootItem(1L, TITLE1, TEXT1, State.TODO)
                .withFirstChild(2L, TITLE2, TEXT2, State.TODO)
                .build();
        nextId = 3L;
        mockSave();

        // When
        List<Item> actual = itemService.saveTreeItems(itemsToSave);
        Item actualPrevious = actual.get(0);
        Item actualItem = actual.get(1);
        Item actualChildItem = actualItem.getChildren().getFirst();

        // Then
        // Appel à sauvegarder une fois pour le précédent et 2 fois pour les nouveaux
        verify(itemRepository, times(3)).save(any());
        // Vérifier les valeurs
        Item itemToSave = itemsToSave.getFirst();
        Item childItemToSave = itemToSave.getChild(0);
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave), toStringValues(actualItem));
        assertEquals(toStringValues(childItemToSave), toStringValues(actualChildItem));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actualItem.getId() > lastItem.getId());
        assertTrue(actualChildItem.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actualItem.getId(), actualPrevious.getNextId());
        assertNull(actualItem.getNextId());
        assertNull(actualChildItem.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actualItem.getParentId());
        assertEquals(actualItem.getId(), actualChildItem.getParentId());
    }

    @Test
    void saveTreeItems_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        ItemModel lastItem = new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, null);
        when(this.itemRepository.findFirstByParentIdAndNextIdIsNull(-1L)).thenReturn(Optional.of(lastItem));
        List<Item> itemsToSave = new TreeItemBuilder().withRootItem(1L, TITLE1, TEXT1, State.TODO)
                .withFirstChild(2L, TITLE2, TEXT2, State.TODO)
                .withNextRootItem(12L, TITLE3, TEXT3, State.DONE)
                .withFirstChild(14L, TITLE4, TEXT4, State.TODO)
                .withNextChild(24L, TITLE5, TEXT5, State.IN_PROGRESS)
                .build();
        nextId = 3L;
        mockSave();
        Item itemToSave1 = itemsToSave.getFirst();
        Item itemToSave1Child1 = itemToSave1.getChild(0);
        Item itemToSave2 = itemsToSave.get(1);
        Item itemToSave2Child1 = itemToSave2.getChild(0);
        Item itemToSave2Child2 = itemToSave2.getChild(1);

        // When
        List<Item> actual = itemService.saveTreeItems(itemsToSave);
        Item actualPrevious = actual.get(0);
        Item actualParent1 = actual.get(1);
        Item actualParent2 = actual.get(2);
        Item actual1Child1 = actualParent1.getChild(0);
        Item actual2Child1 = actualParent2.getChild(0);
        Item actual2Child2 = actualParent2.getChild(1);

        // Then
        verify(itemRepository, times(6)).save(any());
        // Vérifier les valeurs
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave1), toStringValues(actualParent1));
        assertEquals(toStringValues(itemToSave2), toStringValues(actualParent2));
        assertEquals(toStringValues(itemToSave1Child1), toStringValues(actual1Child1));
        assertEquals(toStringValues(itemToSave2Child1), toStringValues(actual2Child1));
        assertEquals(toStringValues(itemToSave2Child2), toStringValues(actual2Child2));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actualParent1.getId() > lastItem.getId());
        assertTrue(actualParent2.getId() > lastItem.getId());
        assertTrue(actual1Child1.getId() > lastItem.getId());
        assertTrue(actual2Child1.getId() > lastItem.getId());
        assertTrue(actual2Child2.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actualParent1.getId(), actualPrevious.getNextId());
        assertEquals(actualParent2.getId(), actualParent1.getNextId());
        assertNull(actualParent2.getNextId());
        assertNull(actual1Child1.getNextId());
        assertEquals(actual2Child2.getId(), actual2Child1.getNextId());
        assertNull(actual2Child2.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actualParent1.getParentId());
        assertEquals(-1L, actualParent2.getParentId());
        assertEquals(actualParent1.getId(), actual1Child1.getParentId());
        assertEquals(actualParent2.getId(), actual2Child1.getParentId());
        assertEquals(actualParent2.getId(), actual2Child2.getParentId());
    }

    @Test
    void saveTreeItems_shouldKeepTree_shouldUpdateNextId_when3LevelTree() {
        // Given
        ItemModel lastItem = new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, null);
        when(this.itemRepository.findFirstByParentIdAndNextIdIsNull(-1L)).thenReturn(Optional.of(lastItem));
        List<Item> itemsToSave = new TreeItemBuilder().withRootItem(1L, TITLE1, TEXT1, State.TODO)
                .withFirstChild(2L, TITLE2, TEXT2, State.TODO)
                .withFirstChild(12L, TITLE3, TEXT3, State.DONE)
                .withNextChild(14L, TITLE4, TEXT4, State.TODO)
                .withFirstChild(24L, TITLE5, TEXT5, State.IN_PROGRESS)
                .build();
        nextId = 3L;
        mockSave();
        Item itemToSave1 = itemsToSave.getFirst();
        Item itemToSave1Child1 = itemToSave1.getChild(0);
        Item itemToSave1Child1_1 = itemToSave1Child1.getChild(0);
        Item itemToSave1Child1_2 = itemToSave1Child1.getChild(1);
        Item itemToSave1Child1_2_1 = itemToSave1Child1_2.getChild(0);

        // When
        List<Item> actual = itemService.saveTreeItems(itemsToSave);
        Item actualPrevious = actual.get(0);
        Item actual1 = actual.get(1);
        Item actual1Child1 = actual1.getChild(0);
        Item actual1Child1_1 = actual1Child1.getChild(0);
        Item actual1Child1_2 = actual1Child1.getChild(1);
        Item actual1Child1_2_1 = actual1Child1_2.getChild(0);

        // Then
        verify(itemRepository, times(6)).save(any());
        // Vérifier les valeurs
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave1), toStringValues(actual1));
        assertEquals(toStringValues(itemToSave1Child1), toStringValues(actual1Child1));
        assertEquals(toStringValues(itemToSave1Child1_1), toStringValues(actual1Child1_1));
        assertEquals(toStringValues(itemToSave1Child1_2), toStringValues(actual1Child1_2));
        assertEquals(toStringValues(itemToSave1Child1_2_1), toStringValues(actual1Child1_2_1));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actual1.getId() > lastItem.getId());
        assertTrue(actual1Child1.getId() > lastItem.getId());
        assertTrue(actual1Child1_1.getId() > lastItem.getId());
        assertTrue(actual1Child1_2.getId() > lastItem.getId());
        assertTrue(actual1Child1_2_1.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actual1.getId(), actualPrevious.getNextId());
        assertNull(actual1.getNextId());
        assertNull(actual1Child1.getNextId());
        assertEquals(actual1Child1_2.getId(), actual1Child1_1.getNextId());
        assertNull(actual1Child1_2.getNextId());
        assertNull(actual1Child1_2_1.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actual1.getParentId());
        assertEquals(actual1.getId(), actual1Child1.getParentId());
        assertEquals(actual1Child1.getId(), actual1Child1_1.getParentId());
        assertEquals(actual1Child1.getId(), actual1Child1_2.getParentId());
        assertEquals(actual1Child1_2.getId(), actual1Child1_2_1.getParentId());
    }

    private String toStringValues(Item item) {
        return "title=" + item.getTitle() + ", text=" + item.getText() + ", state=" + item.getState();
    }

    private String toStringValues(ItemModel item) {
        return "title=" + item.getTitle() + ", text=" + item.getText() + ", state=" + item.getState();
    }

}
