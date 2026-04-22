package com.brutos.tool.utilities;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Status;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.service.TreeBuilder;
import com.brutos.tool.service.TreeItemBuilder;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class TreeUtilsTest {
    public static final String TITLE1 = "Titre 1";
    public static final String TITLE2 = "Titre 2";
    public static final String TITLE3 = "Titre 3";
    public static final String TITLE4 = "Titre 4";
    public static final String TITLE5 = "Titre 5";
    public static final String TEXT1 = "Texte 1";
    public static final String TEXT2 = "Texte 2";
    public static final String TEXT3 = "Texte 3";
    public static final String TEXT4 = "Texte 4";
    public static final String TEXT5 = "Texte 5";
    public static final String RACINE = "Racine";

    @Test
    void applyFunctionOnEach_shouldModifyAllItems() {
        List<Tree<Item>> items = new TreeItemBuilder().withRootItem(1L, TITLE1, TEXT1, State.TODO)
                .withFirstChild(2L, TITLE2, TEXT2, State.TODO)
                .withNextRootItem(3L, TITLE3, TEXT3, State.DONE)
                .withFirstChild(4L, TITLE4, TEXT4, State.TODO)
                .withNextChild(5L, TITLE5, TEXT5, State.IN_PROGRESS)
                .buildList();

        TreeUtils.applyFunctionOnEach(items, item -> {
            item.setId(null);
            return item;
        });

        assertNull(items.get(0).getData().getId());
        assertNull(items.get(1).getData().getId());
        assertNull(items.get(0).getChildData(0).getId());
        assertNull(items.get(1).getChildData(0).getId());
        assertNull(items.get(1).getChildData(1).getId());
    }

    @Test
    void transformToListLevelOrder_shouldReturnListLevelOrdered() {
        Item item1 = new Item(1L);
        Item item2 = new Item(2L);
        Item item3 = new Item(3L);
        Item item4 = new Item(4L);
        Item item5 = new Item(5L);
        Item item6 = new Item(6L);
        Item item7 = new Item(7L);
        Item item8 = new Item(8L);
        /*
         *  1 --> 2 --> 3
         *  |    |
         *  |     ---> 4
         *  |
         *  ---> 5 --> 6
         *       |
         *       ---> 7
         *  8
         *
         * => 1, 8, 2, 5, 3, 4, 6, 7
         */
        Tree<Item> treeChild1 = new Tree<>(item2);
        treeChild1.setChildren(List.of(new Tree<>(item3), new Tree<>(item4)));
        Tree<Item> treeChild2 = new Tree<>(item5);
        treeChild2.setChildren(List.of(new Tree<>(item6), new Tree<>(item7)));
        Tree<Item> tree1 = new Tree<>(item1);
        tree1.setChildren(List.of(treeChild1, treeChild2));
        Tree<Item> tree2 = new Tree<>(item8);
        List<Tree<Item>> items = List.of(tree1, tree2);

        List<Item> actual = TreeUtils.transformToListLevelOrder(items);

        // 1, 8, 2, 5, 3, 4, 6, 7
        List<Item> expected = List.of(item1, item8, item2, item5, item3, item4, item6, item7);
        assertEquals(expected, actual);
    }

    @Test
    void transformToListDepthFirst_shouldReturnListDepthFirstOrdered() {
        Item item1 = new Item(1L);
        Item item2 = new Item(2L);
        Item item3 = new Item(3L);
        Item item4 = new Item(4L);
        Item item5 = new Item(5L);
        Item item6 = new Item(6L);
        Item item7 = new Item(7L);
        Item item8 = new Item(8L);
        /*
         *  1 --> 2 --> 3
         *  |    |
         *  |     ---> 4
         *  |
         *  ---> 5 --> 6
         *       |
         *       ---> 7
         *  8
         *
         * => 1, 2, 3, 4, 5, 6, 7, 8
         */
        Tree<Item> treeChild1 = new Tree<>(item2);
        treeChild1.setChildren(List.of(new Tree<>(item3), new Tree<>(item4)));
        Tree<Item> treeChild2 = new Tree<>(item5);
        treeChild2.setChildren(List.of(new Tree<>(item6), new Tree<>(item7)));
        Tree<Item> tree1 = new Tree<>(item1);
        tree1.setChildren(List.of(treeChild1, treeChild2));
        Tree<Item> tree2 = new Tree<>(item8);
        List<Tree<Item>> items = List.of(tree1, tree2);

        List<Item> actual = TreeUtils.transformToListDepthFirst(items);

        // 1, 2, 3, 4, 5, 6, 7, 8
        List<Item> expected = List.of(item1, item2, item3, item4, item5, item6, item7, item8);
        assertEquals(expected, actual);
    }

    @Test
    void transformToTree_shouldReturnTree_shouldAllStatusOk_whenNoChildrenWithNextIdsCorrect() {
        ItemModel itemRacine = new ItemModel(-1L, RACINE, "", State.TODO.name(), null, null);
        ItemModel itemModel1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, 2L);
        ItemModel itemModel2 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), -1L, null);
        List<ItemModel> flatItems = List.of(itemRacine, itemModel1, itemModel2);

        Tree<Item> actual = TreeUtils.transformToTree(flatItems, ItemMapper::toEntity);

        Tree<Item> expected = new TreeBuilder<Item>()
                .withRootItem(new Item(-1L, RACINE, "", State.TODO, null))
                .withFirstChild(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .withNextChild(new Item(2L, TITLE2, TEXT2, State.TODO, -1L))
                .build();
        assertEquals(expected, actual);
    }

    @Test
    void transformToTrees_shouldReturnList_shouldAllStatusOk_whenNoChildrenWithNextIdsCorrect() {
        ItemModel itemModel1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, 2L);
        ItemModel itemModel2 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), -1L, null);
        List<ItemModel> flatItems = List.of(itemModel1, itemModel2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        List<Tree<Item>> expected = List.of(
                new Tree<>(new Item(1L, TITLE1, TEXT1, State.TODO, -1L)),
                new Tree<>(new Item(2L, TITLE2, TEXT2, State.TODO, -1L)));
        assertEquals(expected, actual);
    }

    @Test
    void transformToTrees_shouldReturnTrees_shouldAllStatusOk_whenOneChildrenWithNextIdsCorrect() {
        ItemModel itemModel1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, null);
        ItemModel itemModel2 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 1L, null);
        List<ItemModel> flatItems = List.of(itemModel1, itemModel2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expected = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 1L))
                .build();
        assertEquals(List.of(expected), actual);
    }

    @Test
    void transformToTrees_shouldReturnTree_shouldAllStatusOk_whenTreesWithNextIdsCorrect() {
        ItemModel parent1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, 4L);
        ItemModel parent2 = new ItemModel(4L, TITLE4, TEXT4, State.TODO.name(), -1L, null);
        ItemModel child1parent1 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 1L, 3L);
        ItemModel child2parent1 = new ItemModel(3L, TITLE3, TEXT3, State.TODO.name(), 1L, null);
        List<ItemModel> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expectedTree1 = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 1L))
                .withNextChild(new Item(3L, TITLE3, TEXT3, State.TODO, 1L))
                .build();
        Tree<Item> expectedTree2 = new TreeBuilder<Item>()
                .withRootItem(new Item(4L, TITLE4, TEXT4, State.TODO, -1L))
                .build();
        assertEquals(List.of(expectedTree1, expectedTree2), actual);
    }

    @Test
    void transformToTrees_shouldReturnTree_shouldHaveOrphanStatus_whenTreesWithNextIdsNull() {
        ItemModel parent1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, null);
        ItemModel parent2 = new ItemModel(4L, TITLE4, TEXT4, State.TODO.name(), -1L, null);
        ItemModel child1parent1 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 1L, null);
        ItemModel child2parent1 = new ItemModel(3L, TITLE3, TEXT3, State.TODO.name(), 1L, null);
        List<ItemModel> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expected1 = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L)).withStatus(Status.ORPHAN)
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 1L)).withStatus(Status.ORPHAN)
                .withNextChild(new Item(3L, TITLE3, TEXT3, State.TODO, 1L)).withStatus(Status.ORPHAN)
                .build();
        Tree<Item> expected2 = new TreeBuilder<Item>()
                .withRootItem(new Item(4L, TITLE4, TEXT4, State.TODO, -1L)).withStatus(Status.ORPHAN)
                .build();
        assertEquals(List.of(expected1, expected2), actual);
    }

    @Test
    void transformToTrees_shouldReturnTree_shouldHaveNextNotFoundStatus_whenTreesWithNextIdsNotFound() {
        ItemModel parent1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, 4L);
        ItemModel parent2 = new ItemModel(4L, TITLE4, TEXT4, State.TODO.name(), -1L, 5L);
        ItemModel child1parent1 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 1L, 3L);
        ItemModel child2parent1 = new ItemModel(3L, TITLE3, TEXT3, State.TODO.name(), 1L, 10L);
        List<ItemModel> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expected1 = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 1L))
                .withNextChild(new Item(3L, TITLE3, TEXT3, State.TODO, 1L)).withStatus(Status.NEXT_NOT_FOUND)
                .build();
        Tree<Item> expected2 = new TreeBuilder<Item>()
                .withRootItem(new Item(4L, TITLE4, TEXT4, State.TODO, -1L)).withStatus(Status.NEXT_NOT_FOUND)
                .build();
        assertEquals(List.of(expected1, expected2), actual);
    }

    @Test
    void transformToTrees_shouldReturnTrees_shouldHaveLoopStatus_whenChildrenLoop() {
        ItemModel parent1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, null);
        ItemModel child1parent1 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 1L, 3L);
        ItemModel child2parent1 = new ItemModel(3L, TITLE3, TEXT3, State.TODO.name(), 1L, 4L);
        ItemModel child3Parent1 = new ItemModel(4L, TITLE4, TEXT4, State.TODO.name(), 1L, 2L);
        List<ItemModel> flatItems = List.of(parent1, child2parent1, child1parent1, child3Parent1);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expected = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 1L))
                .withNextChild(new Item(3L, TITLE3, TEXT3, State.TODO, 1L))
                .withNextChild(new Item(4L, TITLE4, TEXT4, State.TODO, 1L)).withStatus(Status.LOOP)
                .build();
        assertEquals(List.of(expected), actual);
    }

    @Test
    void transformToTrees_shouldReturnTrees_shouldHaveLoopStatus_whenTwoChildrenLoop() {
        ItemModel parent1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, null);
        ItemModel child1parent1 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 1L, 2L);
        ItemModel child2parent1 = new ItemModel(3L, TITLE3, TEXT3, State.TODO.name(), 1L, 4L);
        ItemModel child3Parent1 = new ItemModel(4L, TITLE4, TEXT4, State.TODO.name(), 1L, 3L);
        List<ItemModel> flatItems = List.of(parent1, child2parent1, child1parent1, child3Parent1);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expected = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 1L)).withStatus(Status.LOOP)
                .withNextChild(new Item(3L, TITLE3, TEXT3, State.TODO, 1L))
                .withNextChild(new Item(4L, TITLE4, TEXT4, State.TODO, 1L)).withStatus(Status.LOOP)
                .build();

        assertEquals(List.of(expected), actual);
    }

    @Test
    void transformToTrees_shouldReturnTree_shouldHaveOrphanNextNotFoundStatus_whenTreesWithTotalOrphan() {
        ItemModel parent1 = new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, null);
        ItemModel parent2 = new ItemModel(4L, TITLE4, TEXT4, State.TODO.name(), -1L, 5L);
        ItemModel child1parent2 = new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), 4L, 3L);
        ItemModel child2parent2 = new ItemModel(3L, TITLE3, TEXT3, State.TODO.name(), 4L, 10L);
        List<ItemModel> flatItems = List.of(parent1, child2parent2, child1parent2, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);

        Tree<Item> expected1 = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L)).withStatus(Status.ORPHAN)
                .build();
        Tree<Item> expected2 = new TreeBuilder<Item>()
                .withRootItem(new Item(4L, TITLE4, TEXT4, State.TODO, -1L)).withStatus(Status.TOTAL_ORPHAN)
                .withFirstChild(new Item(2L, TITLE2, TEXT2, State.TODO, 4L))
                .withNextChild(new Item(3L, TITLE3, TEXT3, State.TODO, 4L)).withStatus(Status.NEXT_NOT_FOUND)
                .build();
        assertEquals(List.of(expected1, expected2), actual);
    }

    @Test
    void transformToTree_shouldReturnTrees_shouldAllStatusOk_whenNextIdsCorrect() {
        List<ItemModel> flatItems = List.of(
                new ItemModel(1L, TITLE1, TEXT1, State.TODO.name(), -1L, 2L),
                new ItemModel(2L, TITLE2, TEXT2, State.TODO.name(), -1L, null));

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems, ItemMapper::toEntity);
        Tree<Item> expected1 = new TreeBuilder<Item>()
                .withRootItem(new Item(1L, TITLE1, TEXT1, State.TODO, -1L))
                .build();
        Tree<Item> expected2 = new TreeBuilder<Item>()
                .withRootItem(new Item(2L, TITLE2, TEXT2, State.TODO, -1L))
                .build();

        assertEquals(List.of(expected1, expected2), actual);
    }

}
