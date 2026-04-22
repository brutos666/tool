package com.brutos.tool.utilities;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Status;
import com.brutos.tool.entity.Tree;
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
        List<Item> flatItems = List.of(
                new Item(-1L, RACINE, "", State.TODO, null, null),
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 2L),
                new Item(2L, TITLE2, TEXT2, State.TODO, -1L, null));

        Tree<Item> actual = TreeUtils.transformToTree(flatItems);
        Item actualRacine = actual.getData();
        Item actualItem1 = actual.getChildData(0);
        Item actualItem2 = actual.getChildData(1);

        assertEquals(RACINE, actualRacine.getTitle());
        assertEquals(TITLE1, actualItem1.getTitle());
        assertEquals(TITLE2, actualItem2.getTitle());
        assertEquals(Status.OK, actualItem1.getStatus());
        assertEquals(Status.OK, actualItem2.getStatus());
    }

    @Test
    void transformToTrees_shouldReturnList_shouldAllStatusOk_whenNoChildrenWithNextIdsCorrect() {
        List<Item> flatItems = List.of(
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 2L),
                new Item(2L, TITLE2, TEXT2, State.TODO, -1L, null));

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualItem1 = actual.get(0).getData();
        Item actualItem2 = actual.get(1).getData();

        assertEquals(2, actual.size());
        assertEquals(TITLE1, actualItem1.getTitle());
        assertEquals(TITLE2, actualItem2.getTitle());
        assertEquals(Status.OK, actualItem1.getStatus());
        assertEquals(Status.OK, actualItem2.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTrees_shouldAllStatusOk_whenOneChildrenWithNextIdsCorrect() {
        List<Item> flatItems = List.of(
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null),
                new Item(2L, TITLE2, TEXT2, State.TODO, 1L, null));

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent = actual.getFirst().getData();
        Item actualChild = actual.getFirst().getChildData(0);

        assertEquals(1, actual.size());
        assertEquals(TITLE1, actualParent.getTitle());
        assertEquals(TITLE2, actualChild.getTitle());
        assertEquals(1, actual.getFirst().getChildren().size());
        assertEquals(Status.OK, actualParent.getStatus());
        assertEquals(Status.OK, actualChild.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTree_shouldAllStatusOk_whenTreesWithNextIdsCorrect() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 4L);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 3L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, null);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent1 = actual.getFirst().getData();
        Item actualParent2 = actual.get(1).getData();
        Item actualChild1Parent1 = actual.getFirst().getChildData(0);
        Item actualChild2Parent1 = actual.getFirst().getChildData(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(2, actual.getFirst().getChildren().size());
        assertEquals(0, actual.get(1).getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.OK, actualParent2.getStatus());
        assertEquals(Status.OK, actualChild1Parent1.getStatus());
        assertEquals(Status.OK, actualChild2Parent1.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTree_shouldHaveOrphanStatus_whenTreesWithNextIdsNull() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, null);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, null);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent1 = actual.getFirst().getData();
        Item actualParent2 = actual.get(1).getData();
        Item actualChild1Parent1 = actual.getFirst().getChildData(0);
        Item actualChild2Parent1 = actual.getFirst().getChildData(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(2, actual.getFirst().getChildren().size());
        assertEquals(0, actual.get(1).getChildren().size());
        assertEquals(Status.ORPHAN, actualParent1.getStatus());
        assertEquals(Status.ORPHAN, actualParent2.getStatus());
        assertEquals(Status.ORPHAN, actualChild1Parent1.getStatus());
        assertEquals(Status.ORPHAN, actualChild2Parent1.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTree_shouldHaveNextNotFoundStatus_whenTreesWithNextIdsNotFound() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 4L);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, 5L);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 3L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, 10L);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent1 = actual.getFirst().getData();
        Item actualParent2 = actual.get(1).getData();
        Item actualChild1Parent1 = actual.getFirst().getChildData(0);
        Item actualChild2Parent1 = actual.getFirst().getChildData(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(2, actual.getFirst().getChildren().size());
        assertEquals(0, actual.get(1).getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.NEXT_NOT_FOUND, actualParent2.getStatus());
        assertEquals(Status.OK, actualChild1Parent1.getStatus());
        assertEquals(Status.NEXT_NOT_FOUND, actualChild2Parent1.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTrees_shouldHaveLoopStatus_whenChildrenLoop() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 3L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, 4L);
        Item child3Parent1 = new Item(4L, TITLE4, TEXT4, State.TODO, 1L, 2L);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, child3Parent1);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent1 = actual.getFirst().getData();
        Item actualChild1Parent1 = actual.getFirst().getChildData(0);
        Item actualChild2Parent1 = actual.getFirst().getChildData(1);
        Item actualChild3Parent1 = actual.getFirst().getChildData(2);

        assertEquals(1, actual.size());
        assertEquals(3, actual.getFirst().getChildren().size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(toStringValues(actualChild3Parent1), toStringValues(actualChild3Parent1));
        assertEquals(3, actual.getFirst().getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.OK, actualChild1Parent1.getStatus());
        assertEquals(Status.OK, actualChild2Parent1.getStatus());
        assertEquals(Status.LOOP, actualChild3Parent1.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTrees_shouldHaveLoopStatus_whenTwoChildrenLoop() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item child1parent1 = new Item(2L, TITLE2, TEXT2, State.TODO, 1L, 2L);
        Item child2parent1 = new Item(3L, TITLE3, TEXT3, State.TODO, 1L, 4L);
        Item child3Parent1 = new Item(4L, TITLE4, TEXT4, State.TODO, 1L, 3L);
        List<Item> flatItems = List.of(parent1, child2parent1, child1parent1, child3Parent1);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent1 = actual.getFirst().getData();
        Item actualChild1Parent1 = actual.getFirst().getChildData(0);
        Item actualChild2Parent1 = actual.getFirst().getChildData(1);
        Item actualChild3Parent1 = actual.getFirst().getChildData(2);

        assertEquals(1, actual.size());
        assertEquals(3, actual.getFirst().getChildren().size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(actualChild1Parent1), toStringValues(actualChild1Parent1));
        assertEquals(toStringValues(actualChild2Parent1), toStringValues(actualChild2Parent1));
        assertEquals(toStringValues(actualChild3Parent1), toStringValues(actualChild3Parent1));
        assertEquals(3, actual.getFirst().getChildren().size());
        assertEquals(Status.OK, actualParent1.getStatus());
        assertEquals(Status.LOOP, actualChild1Parent1.getStatus());
        assertEquals(Status.OK, actualChild2Parent1.getStatus());
        assertEquals(Status.LOOP, actualChild3Parent1.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTree_shouldHaveOrphanNextNotFoundStatus_whenTreesWithTotalOrphan() {
        Item parent1 = new Item(1L, TITLE1, TEXT1, State.TODO, -1L, null);
        Item parent2 = new Item(4L, TITLE4, TEXT4, State.TODO, -1L, 5L);
        Item child1parent2 = new Item(2L, TITLE2, TEXT2, State.TODO, 4L, 3L);
        Item child2parent2 = new Item(3L, TITLE3, TEXT3, State.TODO, 4L, 10L);
        List<Item> flatItems = List.of(parent1, child2parent2, child1parent2, parent2);

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);
        Item actualParent1 = actual.getFirst().getData();
        Item actualParent2 = actual.get(1).getData();
        Item actualChild1Parent2 = actual.get(1).getChildData(0);
        Item actualChild2Parent2 = actual.get(1).getChildData(1);

        assertEquals(2, actual.size());
        assertEquals(toStringValues(parent1), toStringValues(actualParent1));
        assertEquals(toStringValues(parent2), toStringValues(actualParent2));
        assertEquals(toStringValues(actualChild1Parent2), toStringValues(actualChild1Parent2));
        assertEquals(toStringValues(actualChild2Parent2), toStringValues(actualChild2Parent2));
        assertEquals(0, actual.getFirst().getChildren().size());
        assertEquals(2, actual.get(1).getChildren().size());
        assertEquals(Status.ORPHAN, actualParent1.getStatus());
        assertEquals(Status.TOTAL_ORPHAN, actualParent2.getStatus());
        assertEquals(Status.OK, actualChild1Parent2.getStatus());
        assertEquals(Status.NEXT_NOT_FOUND, actualChild2Parent2.getStatus());
    }

    @Test
    void transformToTree_shouldReturnTrees_shouldAllStatusOk_whenNextIdsCorrect() {
        List<Item> flatItems = List.of(
                new Item(1L, TITLE1, TEXT1, State.TODO, -1L, 2L),
                new Item(2L, TITLE2, TEXT2, State.TODO, -1L, null));

        List<Tree<Item>> actual = TreeUtils.transformToTrees(flatItems);

        assertEquals(2, actual.size());
        assertEquals(TITLE1, actual.get(0).getData().getTitle());
        assertEquals(TITLE2, actual.get(1).getData().getTitle());
    }

    private String toStringValues(Item item) {
        return "title=" + item.getTitle() + ", text=" + item.getText() + ", state=" + item.getState();
    }
}
