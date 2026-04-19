package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.handler.webResult.ItemToSaveWebResult;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.service.ItemService;
import com.brutos.tool.service.TreeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
        List<Tree<Item>> trees = treeService.transformToTrees(items);
        return itemMapper.treeToWebResult(trees);
    }

    @PostMapping("/save")
    public ItemToSaveWebResult saveItem(@RequestBody ItemToSaveWebResult itemToSaveWebRequest) {
        Tree<Item> treeItem = itemMapper.toTreeEntity(itemToSaveWebRequest.getItem());
        Optional<Item> optionalPreviousItem = Optional.empty();
        if (itemToSaveWebRequest.getPreviousItem() != null) {
            Item previousItem = itemMapper.toEntity(itemToSaveWebRequest.getPreviousItem());
            optionalPreviousItem = Optional.of(previousItem);
        }
        List<Item> savedItems = itemService.saveTreeItem(optionalPreviousItem, itemToSaveWebRequest.getNextItemId(), treeItem);
        ItemToSaveWebResult result = new ItemToSaveWebResult();
        if (optionalPreviousItem.isPresent()) {
            result.setPreviousItem(itemMapper.toWebResult(savedItems.getFirst()));
            savedItems = savedItems.subList(1, savedItems.size());
        }
        Tree<Item> itemTree = treeService.transformToTree(savedItems);
        result.setNextItemId(itemToSaveWebRequest.getNextItemId());
        result.setItem(itemMapper.toWebResult(itemTree));
        return result;
    }

    @PostMapping("/delete")
    public ItemWebResult deleteItem(@RequestBody ItemWebResult itemWebRequest) {
        Item item = itemMapper.toEntity(itemWebRequest);
        itemService.controlItem(item);
        itemService.deleteItem(item);
        return itemWebRequest;
    }

}
