package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.service.DateService;
import com.brutos.tool.service.ItemService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item")
public class ItemListController {
    private static final Logger logger = LogManager.getLogger(ItemListController.class);

    private final DateService dateService;
    private final ItemService itemService;
    private final ItemMapper itemMapper;

    // @Autowired
    public ItemListController(ItemService itemService, DateService dateService, ItemMapper itemMapper) {
        this.itemService = itemService;
        this.dateService = dateService;
        this.itemMapper = itemMapper;
    }

    @GetMapping("/findAllItems")
    public List<ItemWebResult> findAllItems() {
        List<Item> items = this.itemService.findAllItems();
        return this.itemMapper.toWebResult(items);
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
