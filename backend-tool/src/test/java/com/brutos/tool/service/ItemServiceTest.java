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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
    void saveTreeItem_shouldUpdatePreviousNextId_whenExistPrevious() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Item item = new ItemBuilder().withCrudMode(CRUDMode.CREATE).withTitle(TITLE1).withText(TEXT1)
                .withState(State.TODO).withParentId(-1L).build();
        Tree<Item> itemTree = new Tree<>(item);
        TreeInfos treeInfos = new TreeInfos(itemTree, lastItem, -1L, null);
        nextId = 3L;
        mockSaveAll();

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);

        // Then
        Item expectedPrevious = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Tree<Item> expectedTree = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, null))));
        assertTrue(actual.getPreviousItem().isPresent());
        assertEquals(expectedPrevious, actual.getPreviousItem().get());
        assertEquals(expectedTree, actual.getTreeItem());
    }

    @Test
    void saveTreeItem_shouldKeepTree_whenExistChildren() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Item itemToSave1 = new ItemBuilder().withCrudMode(CRUDMode.CREATE).withTitle(TITLE1).withText(TEXT1)
                .withState(State.TODO).withParentId(-1L).build();
        Item itemToSave1Child1 = new ItemBuilder().withCrudMode(CRUDMode.CREATE).withTitle(TITLE2).withText(TEXT2)
                .withState(State.TODO).build();
        Tree<Item> treeItem = new Tree<>(itemToSave1);
        treeItem.addChild(itemToSave1Child1);
        nextId = 3L;
        TreeInfos treeInfos = new TreeInfos(treeItem, lastItem, -1L, 4L);
        mockSaveAll();

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);

        // Then
        Item expectedPrevious = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Tree<Item> expectedTree = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), null, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, 4L),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, null))));
        assertTrue(actual.getPreviousItem().isPresent());
        assertEquals(expectedPrevious, actual.getPreviousItem().get());
        assertEquals(expectedTree, actual.getTreeItem());
    }

    @Test
    void saveTreeItem_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Item itemToSave1 = new ItemBuilder().withCrudMode(CRUDMode.CREATE).withTitle(TITLE1).withText(TEXT1)
                .withState(State.TODO).withParentId(-1L).build();
        Item itemToSave1Child1 = new ItemBuilder().withCrudMode(CRUDMode.CREATE).withTitle(TITLE2).withText(TEXT2)
                .withState(State.TODO).build();
        Item itemToSave1Child2 = new ItemBuilder().withCrudMode(CRUDMode.CREATE).withTitle(TITLE3).withText(TEXT3)
                .withState(State.DONE).build();
        Tree<Item> treeItem = new TreeBuilder<Item>()
                .withRootItem(itemToSave1)
                .withFirstChild(itemToSave1Child1)
                .withNextChild(itemToSave1Child2)
                .build();
        TreeInfos treeInfos = new TreeInfos(treeItem, lastItem, -1L, 12L);
        nextId = 3L;
        mockSaveAll();

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);

        // Then
        Item expectedPrevious = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Tree<Item> expectedTree = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .withNextChild(new Item(5L, TITLE3, TEXT3, State.DONE, 3L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), null, null),
                new ItemModel(null, TITLE3, TEXT3, State.DONE.name(), null, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, 12L),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, 5L),
                new ItemModel(5L, TITLE3, TEXT3, State.DONE.name(), 3L, null))));
        assertTrue(actual.getPreviousItem().isPresent());
        assertEquals(expectedPrevious, actual.getPreviousItem().get());
        assertEquals(expectedTree, actual.getTreeItem());
    }

    @Test
    void saveTreeItem_shouldKeepTree_shouldUpdateNextId_when3LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
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
        treeToSave1Child1.addChild(itemToSave1Child1_1);
        Tree<Item> treeToSave1Child1_2 = treeToSave1Child1.addChild(itemToSave1Child1_2);
        treeToSave1Child1_2.addChild(itemToSave1Child1_2_1);
        nextId = 3L;
        mockSaveAll();
        TreeInfos treeInfos = new TreeInfos(treeToSave1, lastItem, -1L, 15L);

        // When
        TreeInfos actual = itemService.saveTreeItem(treeInfos);

        // Then
        Item expectedPrevious = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Tree<Item> expectedTree = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .withFirstChild(new Item(5L, TITLE3, TEXT3, State.DONE, 4L))
                .withNextChild(new Item(6L, TITLE4, TEXT4, State.TODO, 4L))
                .withFirstChild(new Item(7L, TITLE5, TEXT5, State.TODO, 6L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), null, null),
                new ItemModel(null, TITLE3, TEXT3, State.DONE.name(), null, null),
                new ItemModel(null, TITLE4, TEXT4, State.TODO.name(), null, null),
                new ItemModel(null, TITLE5, TEXT5, State.TODO.name(), null, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, 15L),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, null),
                new ItemModel(5L, TITLE3, TEXT3, State.DONE.name(), 4L, 6L),
                new ItemModel(6L, TITLE4, TEXT4, State.TODO.name(), 4L, null),
                new ItemModel(7L, TITLE5, TEXT5, State.TODO.name(), 6L, null))));
        assertTrue(actual.getPreviousItem().isPresent());
        assertEquals(expectedPrevious, actual.getPreviousItem().get());
        assertEquals(expectedTree, actual.getTreeItem());
    }

    @Test
    void createTreeItems_shouldKeepTree_whenExistChildren() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Optional<Item> optionalLastItem = Optional.of(lastItem);
        List<Tree<Item>> itemsToSave = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .buildList();
        nextId = 3L;
        mockSaveAll();

        // When
        List<Tree<Item>> actual = itemService.createTreeItems(optionalLastItem, -1L, itemsToSave);

        // Then
        Tree<Item> expectedPrevious = new TreeBuilder<Item>()
                .withRootItem(new Item(2L, TITLE, TEXT, State.TODO, -1L))
                .build();
        Tree<Item> expectedItem = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), -1L, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, null))));
        assertEquals(expectedPrevious, actual.get(0));
        assertEquals(expectedItem, actual.get(1));
    }

    @Test
    void createTreeItems_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Optional<Item> optionalLastItem = Optional.of(lastItem);
        List<Tree<Item>> itemsToSave = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .withNextRootItem(null, TITLE3, TEXT3, State.DONE)
                .withFirstChild(null, TITLE4, TEXT4, State.TODO)
                .withNextChild(null, TITLE5, TEXT5, State.IN_PROGRESS)
                .buildList();
        nextId = 3L;
        mockSaveAll();

        // When
        List<Tree<Item>> actual = itemService.createTreeItems(optionalLastItem, -1L, itemsToSave);

        // Then
        Tree<Item> expectedPrevious = new TreeBuilder<Item>()
                .withRootItem(new Item(2L, TITLE, TEXT, State.TODO, -1L))
                .build();
        Tree<Item> expectedItem = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .build();
        Tree<Item> expectedItem2 = new TreeBuilder<Item>()
                .withRootItem(new Item(5L, TITLE3, TEXT3, State.DONE, -1L))
                .withFirstChild(new Item(6L, TITLE4, TEXT4, State.TODO, 5L))
                .withNextChild(new Item(7L, TITLE5, TEXT5, State.IN_PROGRESS, 5L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE3, TEXT3, State.DONE.name(), -1L, null),
                new ItemModel(null, TITLE4, TEXT4, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE5, TEXT5, State.IN_PROGRESS.name(), -1L, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, 5L),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, null),
                new ItemModel(5L, TITLE3, TEXT3, State.DONE.name(), -1L, null),
                new ItemModel(6L, TITLE4, TEXT4, State.TODO.name(), 5L, 7L),
                new ItemModel(7L, TITLE5, TEXT5, State.IN_PROGRESS.name(), 5L, null))));
        assertEquals(List.of(expectedPrevious, expectedItem, expectedItem2), actual);
    }

    @Test
    void createTreeItems_shouldKeepTree_shouldUpdateNextId_when3LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
        Optional<Item> optionalLastItem = Optional.of(lastItem);
        List<Tree<Item>> itemsToSave = new TreeItemBuilder().withRootItem(null, TITLE1, TEXT1, State.TODO)
                .withFirstChild(null, TITLE2, TEXT2, State.TODO)
                .withFirstChild(null, TITLE3, TEXT3, State.DONE)
                .withNextChild(null, TITLE4, TEXT4, State.TODO)
                .withFirstChild(null, TITLE5, TEXT5, State.IN_PROGRESS)
                .buildList();
        nextId = 3L;
        mockSaveAll();

        // When
        List<Tree<Item>> actual = itemService.createTreeItems(optionalLastItem, -1L, itemsToSave);

        // Then
        Tree<Item> expectedPrevious = new TreeBuilder<Item>()
                .withRootItem(new Item(2L, TITLE, TEXT, State.TODO, -1L))
                .build();
        Tree<Item> expected1 = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .withFirstChild(new Item(5L, TITLE3, TEXT3, State.DONE, 4L))
                .withNextChild(new Item(6L, TITLE4, TEXT4, State.TODO, 4L))
                .withFirstChild(new Item(7L, TITLE5, TEXT5, State.IN_PROGRESS, 6L))
                .build();
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE3, TEXT3, State.DONE.name(), -1L, null),
                new ItemModel(null, TITLE4, TEXT4, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE5, TEXT5, State.IN_PROGRESS.name(), -1L, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, null),
                new ItemModel(5L, TITLE3, TEXT3, State.DONE.name(), 4L, 6L),
                new ItemModel(6L, TITLE4, TEXT4, State.TODO.name(), 4L, null),
                new ItemModel(7L, TITLE5, TEXT5, State.IN_PROGRESS.name(), 6L, null))));
        assertEquals(List.of(expectedPrevious, expected1), actual);
    }

    @Test
    void saveTreeItemList_shouldKeepTree_shouldUpdateNextId_when2LevelTree() {
        // Given
        Item lastItem = new Item(2L, TITLE, TEXT, State.TODO, -1L);
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
        List<TreeInfos> treeInfosList = List.of(new TreeInfos(rootItem1, lastItem, -1L, null),
                new TreeInfos(rootItem2, itemToSave1, -1L, null));

        // When
        List<TreeInfos> actual = itemService.saveTreeItemList(treeInfosList);

        // Then
        Tree<Item> expected1 = new TreeBuilder<Item>()
                .withRootItem(new Item(3L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(4L, TITLE2, TEXT2, State.TODO, 3L))
                .build();
        Tree<Item> expected2 = new TreeBuilder<Item>()
                .withRootItem(new Item(5L, TITLE3, TEXT3, State.DONE, -1L))
                .withFirstChild(new Item(6L, TITLE4, TEXT4, State.TODO, 5L))
                .withNextChild(new Item(7L, TITLE5, TEXT5, State.IN_PROGRESS, 5L))
                .build();
        TreeInfos expectedTreeInfos1 = new TreeInfos(expected1,
                new Item(2L, TITLE, TEXT, State.TODO, -1L),
                -1L,
                null);
        TreeInfos expectedTreeInfos2 = new TreeInfos(expected2,
                new Item(3L, TITLE1, TEXT1, State.TODO, -1L),
                -1L,
                null);
        // Verifier que les modèles sauvés sont corrects
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(null, TITLE1, TEXT1, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE2, TEXT2, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE3, TEXT3, State.DONE.name(), -1L, null),
                new ItemModel(null, TITLE4, TEXT4, State.TODO.name(), -1L, null),
                new ItemModel(null, TITLE5, TEXT5, State.IN_PROGRESS.name(), -1L, null))));
        verify(itemRepository).saveAll(eq(List.of(
                new ItemModel(2L, TITLE, TEXT, State.TODO.name(), -1L, 3L),
                new ItemModel(3L, TITLE1, TEXT1, State.TODO.name(), -1L, 5L),
                new ItemModel(4L, TITLE2, TEXT2, State.TODO.name(), 3L, null),
                new ItemModel(5L, TITLE3, TEXT3, State.DONE.name(), -1L, null),
                new ItemModel(6L, TITLE4, TEXT4, State.TODO.name(), 5L, 7L),
                new ItemModel(7L, TITLE5, TEXT5, State.IN_PROGRESS.name(), 5L, null))));
        assertEquals(List.of(expectedTreeInfos1, expectedTreeInfos2), actual);
    }
}
