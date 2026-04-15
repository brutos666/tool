package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Status;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    public ItemService(ItemRepository itemRepository, ItemMapper itemMapper) {
        this.itemRepository = itemRepository;
        this.itemMapper = itemMapper;
    }

    public Item save(Item item) {
        ItemModel itemModel = itemRepository.save(itemMapper.toModel(item));
        return itemMapper.toEntity(itemModel);
    }

    @Transactional
    public List<Item> saveTreeItems(List<Item> items) {
        List<ItemModel> itemsModel = convertTreeToItemModelList(items);
        Iterable<ItemModel> savedItemsModel = this.itemRepository.saveAll(itemsModel);
        List<ItemModel> savedItems = new ArrayList<>();
        savedItemsModel.forEach(savedItems::add);

        updateIds(items, savedItems);
        updatePreviousNext(savedItems);

        Iterable<ItemModel> modifiedItems = this.itemRepository.saveAll(savedItems);

        // On renvoie le retour de la sauvegarde sous forme d'arbre
        List<Item> flatList = itemMapper.toEntity(modifiedItems);
        return transformToTree(flatList);
    }

    public List<Item> findAllItems() {
        List<Item> flatList = itemMapper.toEntity(itemRepository.findAll());
        return transformToTree(flatList);
    }

    public List<Item> transformToTree(List<Item> flatList) {
        Map<Long, List<Item>> sortedItems = sortItems(flatList);
        return getChildren(-1L, sortedItems);
    }

    public void deleteItem(Item item) {
        // Recherche de l'item précédent
        Optional<ItemModel> previousItem = itemRepository.findFirstByParentIdAndNextId(item.getParentId(), item.getId());
        if (previousItem.isPresent()) {
            // Recherche de l'item suivant
            previousItem.get().setNextId(item.getNextId());
            itemRepository.save(previousItem.get());
        }
        itemRepository.deleteById(item.getId());
        for (Item child : item.getChildren()) {
            deleteItem(child);
        }
    }

    public void controlItem(Item item) {
        if (item.getId() == null) {
            throw new IllegalArgumentException("id (ID de la tâche) est obligatoire");
        }
    }

    private void updateIds(List<Item> items, List<ItemModel> savedItems) {
        Item lastChild = items.getLast();
        int modeleIndex = 0;
        ItemModel currentModel = null;
        for (Item item : items) {
            currentModel = savedItems.get(modeleIndex);
            modeleIndex = updateIds(modeleIndex, savedItems, item, -1L);
            currentModel.setNextId(item == lastChild ? null : savedItems.get(modeleIndex).getId());
        }
    }

    /**
     * Modification des identifiants des modèles et des items en parcourant l'arbre d'origine
     * et la liste des modèles via un index
     *
     * @param modeleIndex : index de parcours des modèles
     * @param itemsModel  : Liste des modèles
     * @param treeItem    : Arbre des items
     * @param parentId    : identifiant du parent à affecter au modèle à la position index
     * @return : index de parcours des modèles
     */
    private int updateIds(int modeleIndex, List<ItemModel> itemsModel, Item treeItem, Long parentId) {
        ItemModel itemModel = itemsModel.get(modeleIndex);
        itemModel.setParentId(parentId);
        modeleIndex++;
        if (treeItem.getChildren().isEmpty()) {
            return modeleIndex;
        }
        ItemModel childModel = null;
        Item lastChild = treeItem.getChildren().getLast();
        for (Item item : treeItem.getChildren()) {
            childModel = itemsModel.get(modeleIndex);
            modeleIndex = updateIds(modeleIndex, itemsModel, item, itemModel.getId());
            childModel.setNextId(item == lastChild ? null : itemsModel.get(modeleIndex).getId());
        }
        return modeleIndex;
    }

    private List<ItemModel> updatePreviousNext(List<ItemModel> savedItems) {
        // Récupérer le dernier item ayant -1 comme parentId et modifier son nextId avant
        // l'identifiant du premier des items ajoutés
        Optional<ItemModel> optionalLastItem = this.itemRepository.findFirstByParentIdAndNextIdIsNull(-1L);
        if (optionalLastItem.isPresent()) {
            ItemModel lastItem = optionalLastItem.get();
            lastItem.setNextId(savedItems.getFirst().getId());
            savedItems.addFirst(lastItem);
        }
        return savedItems;
    }

    private List<ItemModel> convertTreeToItemModelList(List<Item> treeItems) {
        return treeItems.stream().flatMap(item -> flatten(item).stream())
                .map(this::convertToNewItemModel).toList();
    }

    private ItemModel convertToNewItemModel(Item item) {
        ItemModel model = this.itemMapper.toModel(item);
        model.setId(null);
        model.setParentId(null);
        model.setNextId(null);
        return model;
    }

    private List<Item> flatten(Item item) {
        List<Item> flattenItems = new ArrayList<>();
        flattenItems.add(item);
        for (Item child : item.getChildren()) {
            flattenItems.addAll(flatten(child));
        }
        return flattenItems;
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

    private List<Item> getChildren(Long itemId, Map<Long, List<Item>> sortedItems) {
        List<Item> childrenItems = sortedItems.get(itemId);
        if (childrenItems == null) {
            return new ArrayList<>();
        }
        List<Item> resultItems = new ArrayList<>();
        for (Item childItem : childrenItems) {
            childItem.setChildren(getChildren(childItem.getId(), sortedItems));
            resultItems.add(childItem);
        }
        return resultItems;
    }

    private List<Item> sortSameParentItems(List<Item> items) {
        if (items.size() == 1) {
            return items;
        }
        Map<Long, Item> itemLeftToProccessById = items.stream().collect(Collectors.toMap(Item::getId, item -> item));
        List<Long> nextIds = items.stream().map(Item::getZeroOrNextId).toList();
        // Recherche des items qui n'existe pas en tant que nextId
        List<Item> firstItems = itemLeftToProccessById.values().stream()
                .filter(item -> !nextIds.contains(item.getId()))
                .toList();
        // S'il y en a plusieurs, on les déclare comme orphelins
        if (firstItems.size() > 1) {
            firstItems.forEach(item -> item.setStatus(Status.ORPHAN));
        }
        List<Item> sortedItems = new ArrayList<>();
        // Pour éviter les boucles, on va retirer les éléments traités de itemLeftToProccessById
        for (Item firstItem : firstItems) {
            List<Item> itemsProcess = process(itemLeftToProccessById, firstItem.getId());
            sortedItems.addAll(itemsProcess);
        }
        while (!itemLeftToProccessById.isEmpty()) {
            // Ici il y a probablement une ou plusieurs boucles
            Long id = itemLeftToProccessById.keySet().iterator().next();
            List<Item> itemsProcess = process(itemLeftToProccessById, id);
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
