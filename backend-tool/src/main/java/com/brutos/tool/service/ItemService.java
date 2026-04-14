package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import org.springframework.stereotype.Service;

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

    public List<Item> saveTreeItems(List<Item> items) {
        List<Item> savedItems = new ArrayList<>();
        Long nextId = null;
        List<Item> reverseItemsToSave = items.reversed();
        for (Item itemToSave : reverseItemsToSave) {
            Item savedItem = saveTreeItem(-1L, nextId, itemToSave);
            savedItems.addFirst(savedItem);
            nextId = savedItem.getId();
        }
        // Récupérer le dernier item ayant -1 comme parentId et modifier son nextId avant
        // l'identifiant du premier des items ajoutés
        Optional<ItemModel> lastItem = this.itemRepository.findFirstByParentIdAndNextIdIsNull(-1L);
        if (lastItem.isPresent()) {
            lastItem.get().setNextId(savedItems.getFirst().getId());
            ItemModel itemModel = this.itemRepository.save(lastItem.get());
            savedItems.addFirst(this.itemMapper.toEntity(itemModel));
        }
        // Retourne l'item modifié et tous les autres items ajoutés
        return savedItems;
    }

    private Item saveTreeItem(Long parentId, Long nextId, Item item) {
        Item itemToSave = new Item();
        itemToSave.setId(null);
        itemToSave.setNextId(nextId);
        itemToSave.setParentId(parentId);
        itemToSave.setText(item.getText());
        itemToSave.setTitle(item.getTitle());
        itemToSave.setState(item.getState());

        Item savedItem = save(itemToSave);

        Long childNextId = null;
        List<Item> savedChildren = new ArrayList<>();
        List<Item> reverseChildrenToSave = item.getChildren().reversed();
        for (Item childItemToSave : reverseChildrenToSave) {
            Item savedChildItem = saveTreeItem(savedItem.getId(), childNextId, childItemToSave);
            savedChildren.addFirst(savedChildItem);
            childNextId = savedChildItem.getId();
        }
        savedItem.setChildren(savedChildren);
        return savedItem;
    }

    public List<Item> findAllItems() {
        List<Item> flatList = itemMapper.toEntity(itemRepository.findAll());
        return transformToTree(flatList);
    }

    public List<Item> transformToTree(List<Item> flatList) {
        Map<Long, List<Item>> sortedItems = sortItems(flatList);
        return getChildren(-1L, sortedItems);
    }

    public Map<Long, List<Item>> sortItems(List<Item> items) {
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

    public List<Item> getChildren(Long itemId, Map<Long, List<Item>> sortedItems) {
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

    private List<Item> sortSameParentItems(List<Item> items) {
        List<Item> sortedItems = new ArrayList<>();
        Item item = getLast(items);
        while (item != null) {
            sortedItems.addFirst(item);
            item = getPrev(item, items);
        }
        return sortedItems;
    }

    private Item getLast(List<Item> items) {
        return items.stream().filter(item -> item.getNextId() == null).findFirst().orElse(items.getFirst());
    }

    private Item getPrev(Item itemNext, List<Item> items) {
        Optional<Item> optionalItem = items.stream()
                .filter(item -> itemNext.getId().equals(item.getNextId()))
                .findFirst();
        return optionalItem.orElse(null);
    }

}
