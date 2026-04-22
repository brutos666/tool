package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.entity.TreeInfos;
import com.brutos.tool.handler.webResult.ItemToSaveWebResult;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.mapper.ItemToSaveMapper;
import com.brutos.tool.service.ItemService;
import com.brutos.tool.utilities.TreeUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item")
public class ItemListController {

    private final ItemService itemService;

    // @Autowired
    public ItemListController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping("/findAllItems")
    public List<ItemWebResult> findAllItems() {
        List<Item> items = itemService.getAllItems();
        List<Tree<Item>> trees = TreeUtils.transformToTrees(items);
        return ItemMapper.treeToWebResult(trees);
    }

    @PostMapping("/save")
    public ItemToSaveWebResult saveItem(@RequestBody ItemToSaveWebResult itemToSaveWebRequest) {
        TreeInfos treeInfos = ItemToSaveMapper.toEntity(itemToSaveWebRequest);

        TreeInfos savedItems = itemService.saveTreeItem(treeInfos);

        return ItemToSaveMapper.toWebResult(savedItems);
    }

    @PostMapping("/delete")
    public ItemWebResult deleteItem(@RequestBody ItemWebResult itemWebRequest) {
        Item item = ItemMapper.toEntity(itemWebRequest);
        itemService.controlItem(item);
        itemService.deleteItem(item);
        return itemWebRequest;
    }

}
