package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.service.CsvService;
import com.brutos.tool.service.ItemService;
import com.brutos.tool.utilities.TreeUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/import")
public class ImportController {
    private final CsvService csvService;
    private final ItemService itemService;

    // @Autowired
    public ImportController(CsvService csvService, ItemService itemService) {
        this.csvService = csvService;
        this.itemService = itemService;
    }

    @PostMapping("/items")
    public List<ItemWebResult> importItems(@RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        List<Item> flatItems = csvService.convertCsvToItems(file);
        List<Tree<Item>> items = TreeUtils.transformToTrees(flatItems);
        TreeUtils.applyFunctionOnEach(items, itemService::setNullIds);
        Optional<Item> lastItem = itemService.getLastRootItem();
        List<Item> savedItems = itemService.createTreeItems(lastItem, -1L, items);
        List<Tree<Item>> savedItemsTree = TreeUtils.transformToTrees(savedItems);
        return ItemMapper.treeToWebResult(savedItemsTree);
    }

}
