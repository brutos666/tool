package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.service.ItemService;
import com.brutos.tool.service.TreeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item")
public class ItemListController {

    private final ItemService itemService;
    private final TreeService<Item> treeService;
    private final ItemMapper itemMapper;

    // @Autowired
    public ItemListController(ItemService itemService, TreeService<Item> treeService, ItemMapper itemMapper) {
        this.itemService = itemService;
        this.treeService = treeService;
        this.itemMapper = itemMapper;
    }

    @GetMapping("/findAllItems")
    public List<ItemWebResult> findAllItems() {
        List<Item> items = itemService.getAllItems();
        List<Tree<Item>> trees = treeService.transformToTree(items);
        return itemMapper.treeToWebResult(trees);
    }

    @PostMapping("/save")
    public ItemWebResult saveItem(@RequestBody ItemWebResult itemWebRequest) {
        Item item = itemService.save(itemMapper.toEntity(itemWebRequest));
        return itemMapper.toWebResult(item);
    }

    @PostMapping("/delete")
    public ItemWebResult deleteItem(@RequestBody ItemWebResult itemWebRequest) {
        Item item = itemMapper.toEntity(itemWebRequest);
        itemService.controlItem(item);
        itemService.deleteItem(item);
        return itemWebRequest;
    }

}
