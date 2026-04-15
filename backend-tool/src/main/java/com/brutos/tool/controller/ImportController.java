package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.service.CsvService;
import com.brutos.tool.service.ItemService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/import")
public class ImportController {
    private final CsvService csvService;
    private final ItemService itemService;
    private final ItemMapper itemMapper;

    // @Autowired
    public ImportController(CsvService csvService, ItemService itemService, ItemMapper itemMapper) {
        this.csvService = csvService;
        this.itemService = itemService;
        this.itemMapper = itemMapper;
    }

    @PostMapping("/items")
    public List<ItemWebResult> importItems(@RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        List<Item> flatItems = this.csvService.convertCsvToItems(file);
        List<Item> items = this.itemService.transformToTree(flatItems);
        List<Item> savedItems = this.itemService.saveTreeItems(items);
        return this.itemMapper.toWebResult(savedItems);
    }

}
