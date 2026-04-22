package com.brutos.tool.service;

import com.brutos.tool.entity.*;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

    private ItemService itemService;

    private Long nextId = 1L;

    @BeforeEach
    public void setUp() {
        itemService = new ItemService(itemRepository);

    }

    private void mockSave() {
        // Mock de la sauvegarde d'un nouvel item
        when(itemRepository.save(any(ItemModel.class))).thenAnswer(invocation -> {
            ItemModel input = invocation.getArgument(0);
            ItemModel copy = new ItemModel();
            // Ne générer un nouvel ID que si l'objet a un ID null
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

    private void mockSaveAll() {
        when(itemRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<ItemModel> inputs = invocation.getArgument(0);
            return inputs.stream().map(this::convertToSavedItem).toList();
        });
    }

    private ItemModel convertToSavedItem(ItemModel input) {
        ItemModel copy = new ItemModel();
        // Ne générer un nouvel ID que si l'objet a un ID null
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
    }

    @Test
    void shouldSaveItem() {
        // Given
        mockSave();

        // When
        Item actual = itemService.save(new Item(TITLE, TEXT));

        // Then
        assertNotNull(actual.getId());
        assertEquals(TITLE, actual.getTitle());
        assertEquals(TEXT, actual.getText());
    }

    @Test
    void saveTreeItem_shouldUpdatePreviousNextId_whenExistPrevious() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Item item = new ItemBuilder().withCrudMode(CRUDMode.CREATE)
                .withTitle(TITLE1).withText(TEXT1).withState(State.TODO)
                .withParentId(-1L).build();
        Tree<Item> itemTree = new Tree<>(item);
        TreeInfos treeInfos = new TreeInfos(itemTree, lastItem, -1L, null);
        nextId = 3L;
        mockSaveAll();

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);
        Item actualPrevious = actual.getPreviousItem().orElse(null);
        Item actualItem = actual.getTreeItem().getData();

        // Then
        // Appel à sauvegarder une fois pour le précédent et 1 fois pour le nouveau
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        assertNotNull(actualPrevious);
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(item), toStringValues(actual.getTreeItem().getData()));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actualItem.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actualItem.getId(), actualPrevious.getNextId());
        assertNull(actualItem.getNextId());
        // Vérifier les parents (tous -1L)
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actualItem.getParentId());
    }

    @Test
    void saveTreeItem_shouldKeepTree_whenExistChildren() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Item itemToSave1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE)
                .withTitle(TITLE1)
                .withText(TEXT1)
                .withState(State.TODO)
                .withParentId(-1L)
                .build();
        Item itemToSave1Child1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE)
                .withTitle(TITLE2)
                .withText(TEXT2)
                .withState(State.TODO)
                .build();
        Tree<Item> treeItem = new Tree<>(itemToSave1);
        treeItem.addChild(itemToSave1Child1);
        nextId = 3L;
        TreeInfos treeInfos = new TreeInfos(treeItem, lastItem, -1L, 4L);
        mockSaveAll();

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);
        Item actualPrevious = actual.getPreviousItem().orElse(null);
        Item actualItem = actual.getTreeItem().getData();
        Item actualChildItem = actual.getTreeItem().getChildData(0);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        assertNotNull(actualPrevious);
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave1), toStringValues(actualItem));
        assertEquals(toStringValues(itemToSave1Child1), toStringValues(actualChildItem));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actualItem.getId() > lastItem.getId());
        assertTrue(actualChildItem.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actualItem.getId(), actualPrevious.getNextId());
        assertEquals(4L, actualItem.getNextId());
        assertNull(actualChildItem.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actualItem.getParentId());
        assertEquals(actualItem.getId(), actualChildItem.getParentId());
    }

    @Test
    void saveTreeItem_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Item itemToSave1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE)
                .withTitle(TITLE1)
                .withText(TEXT1)
                .withState(State.TODO)
                .withParentId(-1L)
                .build();
        Item itemToSave1Child1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE)
                .withTitle(TITLE2)
                .withText(TEXT2)
                .withState(State.TODO)
                .build();
        Item itemToSave1Child2 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE)
                .withTitle(TITLE3)
                .withText(TEXT3)
                .withState(State.DONE)
                .build();
        Tree<Item> treeItem = new Tree<>(itemToSave1);
        treeItem.addChild(itemToSave1Child1);
        treeItem.addChild(itemToSave1Child2);
        TreeInfos treeInfos = new TreeInfos(treeItem, lastItem, -1L, 12L);
        nextId = 3L;
        mockSaveAll();

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);
        Item actualPrevious = actual.getPreviousItem().orElse(null);
        Item actual1 = actual.getTreeItem().getData();
        Item actual1Child1 = actual.getTreeItem().getChildData(0);
        Item actual1Child2 = actual.getTreeItem().getChildData(1);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        assertNotNull(actualPrevious);
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave1), toStringValues(actual1));
        assertEquals(toStringValues(itemToSave1Child1), toStringValues(actual1Child1));
        assertEquals(toStringValues(itemToSave1Child2), toStringValues(actual1Child2));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actual1.getId() > lastItem.getId());
        assertTrue(actual1Child1.getId() > lastItem.getId());
        assertTrue(actual1Child2.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actual1.getId(), actualPrevious.getNextId());
        assertEquals(actual1Child2.getId(), actual1Child1.getNextId());
        assertNull(actual1Child2.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actual1.getParentId());
        assertEquals(actual1.getId(), actual1Child1.getParentId());
        assertEquals(actual1.getId(), actual1Child2.getParentId());
    }

    @Test
    void saveTreeItem_shouldKeepTree_shouldUpdateNextId_when3LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Item itemToSave1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE).withParentId(-1L).withTitle(TITLE1)
                .withText(TEXT1).withState(State.TODO).build();
        Item itemToSave1Child1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE).withTitle(TITLE2)
                .withText(TEXT2).withState(State.TODO).build();
        Item itemToSave1Child1_1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE).withTitle(TITLE3)
                .withText(TEXT3).withState(State.DONE).build();
        Item itemToSave1Child1_2 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE).withTitle(TITLE4)
                .withText(TEXT4).withState(State.TODO).build();
        Item itemToSave1Child1_2_1 = new ItemBuilder()
                .withCrudMode(CRUDMode.CREATE).withTitle(TITLE5)
                .withText(TEXT5).withState(State.TODO).build();
        Tree<Item> treeToSave1 = new Tree<>(itemToSave1);
        Tree<Item> treeToSave1Child1 = treeToSave1.addChild(itemToSave1Child1);
        Tree<Item> treeToSave1Child1_1 = treeToSave1Child1.addChild(itemToSave1Child1_1);
        Tree<Item> treeToSave1Child1_2 = treeToSave1Child1.addChild(itemToSave1Child1_2);
        Tree<Item> treeToSave1Child1_2_1 = treeToSave1Child1_2.addChild(itemToSave1Child1_2_1);
        nextId = 3L;
        mockSaveAll();
        TreeInfos treeInfos = new TreeInfos(treeToSave1, lastItem, -1L, 15L);

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);
        Item actualPrevious = actual.getPreviousItem().orElse(null);
        Tree<Item> actualTree = actual.getTreeItem();
        Item actual1 = actualTree.getData();
        Tree<Item> actualTreeChild1 = actualTree.getChild(0);
        Item actual1Child1 = actualTreeChild1.getData();
        Item actual1Child1_1 = actualTreeChild1.getChildData(0);
        Item actual1Child1_2 = actualTreeChild1.getChildData(1);
        Item actual1Child1_2_1 = actualTreeChild1.getChild(1).getChildData(0);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        assertNotNull(actualPrevious);
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
        assertEquals(15L, actual1.getNextId());
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

    @Test
    void createTreeItems_shouldKeepTree_whenExistChildren() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Optional<Item> optionalLastItem = Optional.of(lastItem);
        List<Tree<Item>> itemsToSave = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .buildList();
        nextId = 3L;
        mockSaveAll();

        // When
        List<Item> actual = itemService.createTreeItems(optionalLastItem, -1L, itemsToSave);
        Item actualPrevious = actual.get(0);
        Item actualItem = actual.get(1);
        Item actualChildItem = actual.get(2);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        Item itemToSave = itemsToSave.getFirst().getData();
        Item childItemToSave = itemsToSave.getFirst().getChildData(0);
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
    void createTreeItems_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Optional<Item> optionalLastItem = Optional.of(lastItem);
        List<Tree<Item>> itemsToSave = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .withNextRootItem(null, TITLE3, TEXT3, State.DONE)
                .withFirstChild(null, TITLE4, TEXT4, State.TODO)
                .withNextChild(null, TITLE5, TEXT5, State.IN_PROGRESS)
                .buildList();
        nextId = 3L;
        mockSaveAll();
        Item itemToSave1 = itemsToSave.getFirst().getData();
        Item itemToSave1Child1 = itemsToSave.getFirst().getChildData(0);
        Item itemToSave2 = itemsToSave.get(1).getData();
        Item itemToSave2Child1 = itemsToSave.get(1).getChildData(0);
        Item itemToSave2Child2 = itemsToSave.get(1).getChildData(1);

        // When
        List<Item> actual = itemService.createTreeItems(optionalLastItem, -1L, itemsToSave);
        Item actualPrevious = actual.get(0);
        Item actual1 = actual.get(1);
        Item actual1Child1 = actual.get(2);
        Item actual2 = actual.get(3);
        Item actual2Child1 = actual.get(4);
        Item actual2Child2 = actual.get(5);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave1), toStringValues(actual1));
        assertEquals(toStringValues(itemToSave2), toStringValues(actual2));
        assertEquals(toStringValues(itemToSave1Child1), toStringValues(actual1Child1));
        assertEquals(toStringValues(itemToSave2Child1), toStringValues(actual2Child1));
        assertEquals(toStringValues(itemToSave2Child2), toStringValues(actual2Child2));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actual1.getId() > lastItem.getId());
        assertTrue(actual2.getId() > lastItem.getId());
        assertTrue(actual1Child1.getId() > lastItem.getId());
        assertTrue(actual2Child1.getId() > lastItem.getId());
        assertTrue(actual2Child2.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actual1.getId(), actualPrevious.getNextId());
        assertEquals(actual2.getId(), actual1.getNextId());
        assertNull(actual2.getNextId());
        assertNull(actual1Child1.getNextId());
        assertEquals(actual2Child2.getId(), actual2Child1.getNextId());
        assertNull(actual2Child2.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actual1.getParentId());
        assertEquals(-1L, actual2.getParentId());
        assertEquals(actual1.getId(), actual1Child1.getParentId());
        assertEquals(actual2.getId(), actual2Child1.getParentId());
        assertEquals(actual2.getId(), actual2Child2.getParentId());
    }

    @Test
    void createTreeItems_shouldKeepTree_shouldUpdateNextId_when3LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Optional<Item> optionalLastItem = Optional.of(lastItem);
        List<Tree<Item>> itemsToSave = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .withFirstChild(null, TITLE3, TEXT3, State.DONE)
                .withNextChild(null, TITLE4, TEXT4, State.TODO)
                .withFirstChild(null, TITLE5, TEXT5, State.IN_PROGRESS)
                .buildList();
        nextId = 3L;
        mockSaveAll();
        Tree<Item> treeToSave1 = itemsToSave.getFirst();
        Tree<Item> treeToSave1Child1 = treeToSave1.getChild(0);
        Tree<Item> treeToSave1Child1_1 = treeToSave1Child1.getChild(0);
        Tree<Item> treeToSave1Child1_2 = treeToSave1Child1.getChild(1);
        Tree<Item> treeToSave1Child1_2_1 = treeToSave1Child1_2.getChild(0);
        Item itemToSave1 = treeToSave1.getData();
        Item itemToSave1Child1 = treeToSave1Child1.getData();
        Item itemToSave1Child1_1 = treeToSave1Child1_1.getData();
        Item itemToSave1Child1_2 = treeToSave1Child1_2.getData();
        Item itemToSave1Child1_2_1 = treeToSave1Child1_2_1.getData();

        // When
        List<Item> actual = itemService.createTreeItems(optionalLastItem, -1L, itemsToSave);
        Item actualPrevious = actual.get(0);
        Item actual1 = actual.get(1);
        Item actual1Child1 = actual.get(2);
        Item actual1Child1_1 = actual.get(3);
        Item actual1Child1_2 = actual.get(4);
        Item actual1Child1_2_1 = actual.get(5);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
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

    @Test
    void saveTreeItemList_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L, null);
        Tree<Item> rootItem1 = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .build();
        Tree<Item> rootItem2 = new TreeItemBuilder().withRootItem(null, TITLE3, TEXT3, State.DONE)
                .withFirstChild(null, TITLE4, TEXT4, State.TODO)
                .withNextChild(null, TITLE5, TEXT5, State.IN_PROGRESS)
                .build();
        nextId = 3L;
        mockSaveAll();
        Item itemToSave1 = rootItem1.getData();
        Item itemToSave1Child1 = rootItem1.getChildData(0);
        Item itemToSave2 = rootItem2.getData();
        Item itemToSave2Child1 = rootItem2.getChildData(0);
        Item itemToSave2Child2 = rootItem2.getChildData(1);
        List<TreeInfos> treeInfosList = List.of(new TreeInfos(rootItem1, lastItem, -1L, null),
                new TreeInfos(rootItem2, itemToSave1, -1L, null));

        // When
        List<TreeInfos> actual = itemService.saveTreeItemList(treeInfosList);
        TreeInfos actualToSave1 = actual.get(0);
        TreeInfos actualToSave2 = actual.get(1);
        Item actualPrevious = actualToSave1.getPreviousItem().orElse(null);
        Item actual1 = actualToSave1.getTreeItem().getData();
        Item actual1Child1 = actualToSave1.getTreeItem().getChildData(0);
        Item actual2 = actualToSave2.getTreeItem().getData();
        Item actual2Child1 = actualToSave2.getTreeItem().getChildData(0);
        Item actual2Child2 = actualToSave2.getTreeItem().getChildData(1);

        // Then
        verify(itemRepository, times(2)).saveAll(any());
        // Vérifier les valeurs
        assertNotNull(actualPrevious);
        assertEquals(toStringValues(lastItem), toStringValues(actualPrevious));
        assertEquals(toStringValues(itemToSave1), toStringValues(actual1));
        assertEquals(toStringValues(itemToSave2), toStringValues(actual2));
        assertEquals(toStringValues(itemToSave1Child1), toStringValues(actual1Child1));
        assertEquals(toStringValues(itemToSave2Child1), toStringValues(actual2Child1));
        assertEquals(toStringValues(itemToSave2Child2), toStringValues(actual2Child2));
        // Vérifier que les ids sont corrects
        assertEquals(lastItem.getId(), actualPrevious.getId());
        assertTrue(actual1.getId() > lastItem.getId());
        assertTrue(actual2.getId() > lastItem.getId());
        assertTrue(actual1Child1.getId() > lastItem.getId());
        assertTrue(actual2Child1.getId() > lastItem.getId());
        assertTrue(actual2Child2.getId() > lastItem.getId());
        // Vérifier les suivants
        assertEquals(actual1.getId(), actualPrevious.getNextId());
        assertEquals(actual2.getId(), actual1.getNextId());
        assertNull(actual2.getNextId());
        assertNull(actual1Child1.getNextId());
        assertEquals(actual2Child2.getId(), actual2Child1.getNextId());
        assertNull(actual2Child2.getNextId());
        // Vérifier les parents
        assertEquals(-1L, actualPrevious.getParentId());
        assertEquals(-1L, actual1.getParentId());
        assertEquals(-1L, actual2.getParentId());
        assertEquals(actual1.getId(), actual1Child1.getParentId());
        assertEquals(actual2.getId(), actual2Child1.getParentId());
        assertEquals(actual2.getId(), actual2Child2.getParentId());
    }

    private String toStringValues(Item item) {
        return "title=" + item.getTitle() + ", text=" + item.getText() + ", state=" + item.getState();
    }

}
