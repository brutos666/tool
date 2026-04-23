package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.entity.TreeInfos;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.handler.webResult.TreeInfosWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.mapper.TreeInfosMapper;
import com.brutos.tool.service.ItemService;
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
        List<Tree<Item>> trees = itemService.getAllItems();
        return ItemMapper.toWebResult(trees);
    }

    @PostMapping("/save")
    public TreeInfosWebResult saveItem(@RequestBody TreeInfosWebResult treeInfosWebRequest) {
        TreeInfos treeInfos = TreeInfosMapper.toEntity(treeInfosWebRequest);

        TreeInfos savedItems = itemService.saveTreeItem(treeInfos);

        return TreeInfosMapper.toWebResult(savedItems);
    }
}
