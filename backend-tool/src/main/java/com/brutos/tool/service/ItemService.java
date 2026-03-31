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

    public List<Item> findAllItems() {
        return itemMapper.toEntity(itemRepository.findAll());
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

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
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
