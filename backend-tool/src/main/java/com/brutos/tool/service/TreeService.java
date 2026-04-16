package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Status;
import com.brutos.tool.entity.Tree;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TreeService<T> {

    public List<Tree<Item>> transformToTree(List<Item> flatList) {
        Map<Long, List<Item>> sortedItems = sortItems(flatList);
        return getChildren(-1L, sortedItems);
    }

    public void applyFunctionOnEach(List<Tree<T>> trees, Function<T, T> updateItem) {
        for (Tree<T> tree : trees) {
            applyFunctionOnEach(tree, updateItem);
        }
    }

    private void applyFunctionOnEach(Tree<T> tree, Function<T, T> updateItem) {
        T item = tree.getData();
        tree.setData(updateItem.apply(item));
        for (Tree<T> child : tree.getChildren()) {
            applyFunctionOnEach(child, updateItem);
        }
    }

    public List<T> transformToListLevelOrder(List<Tree<T>> trees) {
        List<T> flatItems = new ArrayList<>();
        trees.forEach(child -> flatItems.add(child.getData()));
        for (Tree<T> child : trees) {
            flatItems.addAll(transformToListLevelOrder(child.getChildren()));
        }
        return flatItems;
    }

    public List<T> transformToListDepthFirst(List<Tree<T>> trees) {
        return trees.stream()
                .flatMap(tree -> transformToListDepthFirst(tree).stream())
                .collect(Collectors.toList());
    }

    private List<T> transformToListDepthFirst(Tree<T> tree) {
        List<T> items = new ArrayList<>();
        items.add(tree.getData());
        for (Tree<T> child : tree.getChildren()) {
            items.addAll(transformToListDepthFirst(child));
        }
        return items;
    }

    private Map<Long, List<Item>> sortItems(List<Item> items) {
        // Regrouper par parent
        Map<Long, List<Item>> groupedByParent = items.stream()
                .collect(Collectors.groupingBy(Item::getParentId));
        // Trier les enfants directs entre eux
        Map<Long, List<Item>> sortedItems = new HashMap<>();
        for (Map.Entry<Long, List<Item>> entry : groupedByParent.entrySet()) {
            sortedItems.put(entry.getKey(), sortSameParentItems(entry.getValue()));
        }
        return sortedItems;
    }

    private List<Tree<Item>> getChildren(Long itemId, Map<Long, List<Item>> sortedItems) {
        List<Item> childrenItems = sortedItems.get(itemId);
        if (childrenItems == null) {
            return new ArrayList<>();
        }
        List<Tree<Item>> resultItems = new ArrayList<>();
        for (Item childItem : childrenItems) {
            Tree<Item> tree = new Tree<>(childItem);
            tree.setChildren(getChildren(childItem.getId(), sortedItems));
            resultItems.add(tree);
        }
        return resultItems;
    }

    private List<Item> sortSameParentItems(List<Item> items) {
        if (items.size() == 1) {
            return items;
        }
        Map<Long, Item> itemLeftToProcessById = items.stream().collect(Collectors.toMap(Item::getId, item -> item));
        List<Long> nextIds = items.stream().map(Item::getZeroOrNextId).toList();
        // Recherche des items qui n'existe pas en tant que nextId
        List<Item> firstItems = itemLeftToProcessById.values().stream()
                .filter(item -> !nextIds.contains(item.getId()))
                .toList();
        // S'il y en a plusieurs, on les déclare comme orphelins
        if (firstItems.size() > 1) {
            firstItems.forEach(item -> item.setStatus(Status.ORPHAN));
        }
        List<Item> sortedItems = new ArrayList<>();
        // Pour éviter les boucles, on va retirer les éléments traités de itemLeftToProccessById
        for (Item firstItem : firstItems) {
            List<Item> itemsProcess = process(itemLeftToProcessById, firstItem.getId());
            sortedItems.addAll(itemsProcess);
        }
        while (!itemLeftToProcessById.isEmpty()) {
            // Ici il y a probablement une ou plusieurs boucles
            Long id = itemLeftToProcessById.keySet().iterator().next();
            List<Item> itemsProcess = process(itemLeftToProcessById, id);
            sortedItems.addAll(itemsProcess);
        }
        return sortedItems;
    }

    private List<Item> process(Map<Long, Item> itemById, Long firstId) {
        List<Item> sortedItems = new ArrayList<>();
        List<Long> idsProcessed = new ArrayList<>();
        Long nextId = firstId;
        while (nextId != null && itemById.containsKey(nextId)) {
            Item currentItem = itemById.get(nextId);
            sortedItems.add(currentItem);
            idsProcessed.add(nextId);
            itemById.remove(nextId);
            nextId = currentItem.getNextId();
        }
        if (nextId != null) {
            Item lastItem = sortedItems.getLast();
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
