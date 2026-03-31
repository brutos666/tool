package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.service.ItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/item")
public class ItemListController {

    private final ItemService itemService;
    private final ItemMapper itemMapper;

    // @Autowired
    public ItemListController(ItemService itemService, ItemMapper itemMapper) {
        this.itemService = itemService;
        this.itemMapper = itemMapper;
    }

    @GetMapping("/findAllItems")
    public List<ItemWebResult> findAllItems() {
        List<Item> items = this.itemService.findAllItems();
        Map<Long, List<Item>> sortedItems = this.itemService.sortItems(items);
        return this.itemMapper.toWebResult(-1L, sortedItems);
    }

    @PostMapping("/save")
    public ItemWebResult saveItem(@RequestBody ItemWebResult itemWebRequest) {
        Item item = this.itemService.save(this.itemMapper.toEntity(itemWebRequest));
        return this.itemMapper.toWebResult(item);
    }

    @PostMapping("/delete")
    public ItemWebResult deleteItem(@RequestBody ItemWebResult itemWebRequest) {
        Item item = this.itemMapper.toEntity(itemWebRequest);
        this.itemService.controlItem(item);
        this.itemService.deleteItem(item.getId());
        return itemWebRequest;
    }

}
