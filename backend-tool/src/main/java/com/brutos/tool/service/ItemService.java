package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    public void controlItem(Item item) {
        if (item.getId() == null) {
            throw new IllegalArgumentException("id (ID de la tâche) est obligatoire");
        }
    }
}
