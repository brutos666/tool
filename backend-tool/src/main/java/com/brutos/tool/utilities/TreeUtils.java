package com.brutos.tool.utilities;

import com.brutos.tool.entity.ChainEntity;
import com.brutos.tool.entity.Status;
import com.brutos.tool.entity.Tree;

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

    public static <T extends ChainEntity> List<Tree<T>> transformToTrees(List<T> flatList) {
        Map<Long, List<T>> sortedItems = sortItems(flatList);
        return getChildren(-1L, sortedItems);
    }

    public static <T extends ChainEntity> Tree<T> transformToTree(List<T> flatList) {
        // Extraire éventuellement l'item racine
        T rootItem = flatList.getFirst();
        Map<Long, List<T>> sortedItems = null;
        if (rootItem.getParentId() == null) {
            sortedItems = sortItems(flatList.subList(1, flatList.size()));
        } else {
            sortedItems = sortItems(flatList);
        }
        List<T> childrenItems = sortedItems.get(rootItem.getId());
        if (childrenItems == null) {
            return new Tree<>(rootItem);
        }
        Tree<T> resultItem = new Tree<>(rootItem);
        resultItem.setChildren(getChildren(rootItem.getId(), sortedItems));
        return resultItem;
    }

    private static <T extends ChainEntity> Map<Long, List<T>> sortItems(List<T> items) {
        // Regrouper par parent
        Map<Long, List<T>> groupedByParent = items.stream()
                .collect(Collectors.groupingBy(ChainEntity::getParentId));
        // Trier les enfants directs entre eux
        Map<Long, List<T>> sortedItems = new HashMap<>();
        for (Map.Entry<Long, List<T>> entry : groupedByParent.entrySet()) {
            sortedItems.put(entry.getKey(), sortSameParentItems(entry.getValue()));
        }
        return sortedItems;
    }

    private static <T extends ChainEntity> List<Tree<T>> getChildren(Long itemId, Map<Long, List<T>> sortedItems) {
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

    private static <T extends ChainEntity> List<T> sortSameParentItems(List<T> items) {
        if (items.size() == 1) {
            return items;
        }
        Map<Long, T> itemLeftToProcessById = items.stream().collect(Collectors.toMap(T::getId, item -> item));
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

    /**
     * Contruit la liste des items ordonnés par nextId. Si une incohérence est trouvée, positionne un status sur les
     * items incohérents
     *
     * @param itemById : item par identifiant
     * @param firstId  : identifiant du 1er item
     * @return la liste des items ordonnés par nextId
     */
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
}
