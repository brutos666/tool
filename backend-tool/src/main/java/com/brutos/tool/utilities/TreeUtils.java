package com.brutos.tool.utilities;

import com.brutos.tool.entity.ChainEntity;
import com.brutos.tool.entity.Status;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.entity.TreeEntity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class TreeUtils {
    public static <T> void applyFunctionOnEach(List<Tree<T>> trees, Function<T, T> updateItem) {
        for (Tree<T> tree : trees) {
            applyFunctionOnEach(tree, updateItem);
        }
    }

    public static <T> void applyFunctionOnEach(Tree<T> tree, Function<T, T> updateItem) {
        T item = tree.getData();
        tree.setData(updateItem.apply(item));
        for (Tree<T> child : tree.getChildren()) {
            applyFunctionOnEach(child, updateItem);
        }
    }

    public static <T> List<T> applyFilter(Tree<T> tree, Predicate<T> filterPredicate) {
        T item = tree.getData();
        List<T> filteredItems = new ArrayList<>();
        if (filterPredicate.test(item)) {
            filteredItems.add(item);
        }
        for (Tree<T> child : tree.getChildren()) {
            filteredItems.addAll(applyFilter(child, filterPredicate));
        }
        return filteredItems;
    }

    public static <T> void removeIf(Tree<T> tree, Predicate<T> predicate) {
        tree.getChildren().removeIf(treeChild -> predicate.test(treeChild.getData()));
        for (Tree<T> child : tree.getChildren()) {
            removeIf(child, predicate);
        }
    }

    public static <T> List<T> transformToListLevelOrder(List<Tree<T>> trees) {
        List<T> flatItems = new ArrayList<>();
        trees.forEach(child -> flatItems.add(child.getData()));
        for (Tree<T> child : trees) {
            flatItems.addAll(transformToListLevelOrder(child.getChildren()));
        }
        return flatItems;
    }

    public static <T> List<T> transformToListDepthFirst(List<Tree<T>> trees) {
        return trees.stream()
                .flatMap(tree -> transformToListDepthFirst(tree).stream())
                .collect(Collectors.toList());
    }

    public static <T> List<T> transformToListDepthFirst(Tree<T> tree) {
        List<T> items = new ArrayList<>();
        items.add(tree.getData());
        for (Tree<T> child : tree.getChildren()) {
            items.addAll(transformToListDepthFirst(child));
        }
        return items;
    }

    public static <T extends ChainEntity, R extends TreeEntity> List<T> transformToChain(Tree<R> tree, Long parentId, Long nextId, Function<R, T> convertToChain) {
        // Extraire éventuellement l'item racine
        List<T> flatList = new ArrayList<>();
        T item = convertToChain.apply(tree.getData());
        item.setParentId(parentId);
        item.setNextId(nextId);
        flatList.add(item);
        for (Tree<R> child : tree.getChildren()) {
            Tree<R> next = getNext(child, tree.getChildren());
            flatList.addAll(transformToChain(child, item.getId(), next == null ? null : next.getData().getId(), convertToChain));
        }
        return flatList;
    }

    public static <T> Tree<T> getNext(Tree<T> tree, List<Tree<T>> children) {
        if (tree == children.getLast()) {
            return null;
        }
        return children.get(children.indexOf(tree) + 1);
    }

    public static <T extends ChainEntity, R extends TreeEntity> List<Tree<R>> transformToTrees(Iterable<T> flatList, Function<T, R> convertToTree) {
        List<T> itemsToSort = new ArrayList<>();
        flatList.forEach(itemsToSort::add);
        Map<Long, List<R>> sortedItems = sortItems(itemsToSort, convertToTree);
        return getChildren(-1L, sortedItems);
    }

    public static <T extends ChainEntity, R extends TreeEntity> Tree<R> transformToTree(List<T> flatList, Function<T, R> convertToTree) {
        // Extraire éventuellement l'item racine
        R rootItem = convertToTree.apply(flatList.getFirst());
        Map<Long, List<R>> sortedItems = null;
        if (rootItem.getParentId() == null) {
            sortedItems = sortItems(flatList.subList(1, flatList.size()), convertToTree);
        } else {
            sortedItems = sortItems(flatList, convertToTree);
        }
        List<R> childrenItems = sortedItems.get(rootItem.getId());
        if (childrenItems == null) {
            return new Tree<>(rootItem);
        }
        Tree<R> resultItem = new Tree<>(rootItem);
        resultItem.setChildren(getChildren(rootItem.getId(), sortedItems));
        return resultItem;
    }

    private static <T extends ChainEntity, R extends TreeEntity> Map<Long, List<R>> sortItems(List<T> items, Function<T, R> convertToTree) {
        // Regrouper par parent
        Map<Long, List<T>> groupedByParent = items.stream()
                .collect(Collectors.groupingBy(ChainEntity::getParentId));
        // Trier les enfants directs entre eux
        Map<Long, List<R>> sortedItems = new HashMap<>();
        for (Map.Entry<Long, List<T>> entry : groupedByParent.entrySet()) {
            sortedItems.put(entry.getKey(), sortSameParentItems(entry.getValue(), convertToTree));
        }
        return sortedItems;
    }

    private static <T extends ChainEntity, R extends TreeEntity> List<R> sortSameParentItems(List<T> items, Function<T, R> convertToTree) {
        if (items.size() == 1) {
            return items.stream().map(convertToTree).toList();
        }
        Map<Long, T> itemLeftToProcessById = items.stream()
                .collect(Collectors.toMap(T::getId, item -> item));
        List<Long> nextIds = items
                .stream()
                .map(item -> item.getNextId() == null ? 0L : item.getNextId())
                .toList();
        // Recherche des items qui n'existe pas en tant que nextId
        List<T> firstItems = itemLeftToProcessById.values().stream()
                .filter(item -> !nextIds.contains(item.getId()))
                .toList();
        List<R> sortedItems = new ArrayList<>();
        // Pour éviter les boucles, on va retirer les éléments traités de itemLeftToProccessById
        for (T firstItem : firstItems) {
            List<R> itemsProcess = process(itemLeftToProcessById, firstItem.getId(), convertToTree);
            sortedItems.addAll(itemsProcess);
        }
        if (firstItems.size() > 1) {
            List<Long> ids = firstItems.stream().map(T::getId).toList();
            sortedItems.stream()
                    .filter(sortItem -> ids.contains(sortItem.getId()))
                    .forEach(sortItem -> {
                        if (sortItem.getStatus().equals(Status.NEXT_NOT_FOUND)) {
                            sortItem.setStatus(Status.TOTAL_ORPHAN);
                        } else {
                            sortItem.setStatus(Status.ORPHAN);
                        }
                    });
        }

        while (!itemLeftToProcessById.isEmpty()) {
            // Ici il y a probablement une ou plusieurs boucles
            Long id = itemLeftToProcessById.keySet().iterator().next();
            List<R> itemsProcess = process(itemLeftToProcessById, id, convertToTree);
            sortedItems.addAll(itemsProcess);
        }
        return sortedItems;
    }

    private static <T extends TreeEntity> List<Tree<T>> getChildren(Long itemId, Map<Long, List<T>> sortedItems) {
        List<T> childrenItems = sortedItems.get(itemId);
        if (childrenItems == null) {
            return new ArrayList<>();
        }
        List<Tree<T>> resultItems = new ArrayList<>();
        for (T childItem : childrenItems) {
            Tree<T> tree = new Tree<>(childItem);
            tree.setChildren(getChildren(childItem.getId(), sortedItems));
            resultItems.add(tree);
        }
        return resultItems;
    }
/*
    private static <T extends ChainEntity> List<T> sortSameParentItems(List<T> items) {
        if (items.size() == 1) {
            return items;
        }
        Map<Long, T> itemLeftToProcessById = items.stream()
                .collect(Collectors.toMap(T::getId, item -> item));
        List<Long> nextIds = items
                .stream()
                .map(item -> item.getNextId() == null ? 0L : item.getNextId())
                .toList();
        // Recherche des items qui n'existe pas en tant que nextId
        List<T> firstItems = itemLeftToProcessById.values().stream()
                .filter(item -> !nextIds.contains(item.getId()))
                .toList();
        // S'il y en a plusieurs, on les déclare comme orphelins
        if (firstItems.size() > 1) {
            firstItems.forEach(item -> item.setStatus(Status.ORPHAN));
        }
        List<T> sortedItems = new ArrayList<>();
        // Pour éviter les boucles, on va retirer les éléments traités de itemLeftToProccessById
        for (T firstItem : firstItems) {
            List<T> itemsProcess = process(itemLeftToProcessById, firstItem.getId());
            sortedItems.addAll(itemsProcess);
        }
        while (!itemLeftToProcessById.isEmpty()) {
            // Ici il y a probablement une ou plusieurs boucles
            Long id = itemLeftToProcessById.keySet().iterator().next();
            List<T> itemsProcess = process(itemLeftToProcessById, id);
            sortedItems.addAll(itemsProcess);
        }
        return sortedItems;
    }


     private static <T extends ChainEntity> List<T> process(Map<Long, T> itemById, Long firstId) {
        List<T> sortedItems = new ArrayList<>();
        List<Long> idsProcessed = new ArrayList<>();
        Long nextId = firstId;
        while (nextId != null && itemById.containsKey(nextId)) {
            T currentItem = itemById.get(nextId);
            sortedItems.add(currentItem);
            idsProcessed.add(nextId);
            itemById.remove(nextId);
            nextId = currentItem.getNextId();
        }
        if (nextId != null) {
            T lastItem = sortedItems.getLast();
            // S'il existe dans la liste, alors il s'agit d'une boucle
            if (idsProcessed.contains(nextId)) {
                lastItem.setStatus(Status.LOOP);
            } else if (lastItem.getStatus().equals(Status.ORPHAN)) {
                lastItem.setStatus(Status.TOTAL_ORPHAN);
            } else {
                lastItem.setStatus(Status.NEXT_NOT_FOUND);
            }
        }
        return sortedItems;
    }
*/

    /**
     * Construit la liste des items ordonnés par nextId. Si une incohérence est trouvée, positionne un status sur les
     * items incohérents
     *
     * @param itemById : item par identifiant
     * @param firstId  : identifiant du 1er item
     * @return la liste des items ordonnés par nextId
     */
    private static <T extends ChainEntity, R extends TreeEntity> List<R> process(Map<Long, T> itemById, Long firstId, Function<T, R> convertToTree) {
        List<R> sortedItems = new ArrayList<>();
        List<Long> idsProcessed = new ArrayList<>();
        Long nextId = firstId;
        while (nextId != null && itemById.containsKey(nextId)) {
            T currentItem = itemById.get(nextId);
            sortedItems.add(convertToTree.apply(currentItem));
            idsProcessed.add(nextId);
            itemById.remove(nextId);
            nextId = currentItem.getNextId();
        }
        if (nextId != null) {
            R lastItem = sortedItems.getLast();
            // S'il existe dans la liste, alors il s'agit d'une boucle
            if (idsProcessed.contains(nextId)) {
                lastItem.setStatus(Status.LOOP);
            } else if (lastItem.getStatus().equals(Status.ORPHAN)) {
                lastItem.setStatus(Status.TOTAL_ORPHAN);
            } else {
                lastItem.setStatus(Status.NEXT_NOT_FOUND);
            }
        }
        return sortedItems;
    }
}
