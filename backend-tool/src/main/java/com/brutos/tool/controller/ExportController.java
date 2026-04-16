package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.service.CsvService;
import com.brutos.tool.service.ItemService;
import com.brutos.tool.service.TreeService;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final CsvService csvService;
    private final ItemService itemService;
    private final TreeService<Item> treeService;

    // @Autowired
    public ExportController(CsvService csvService, ItemService itemService, TreeService<Item> treeService) {
        this.csvService = csvService;
        this.itemService = itemService;
        this.treeService = treeService;
    }

    @GetMapping("/allItems")
    public ResponseEntity<String> findAllItems() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException {
        List<Item> items = itemService.getAllItems();
        // Permet de trier les items pour rendre le fichier exporté plus lisible
        List<Tree<Item>> trees = treeService.transformToTree(items);
        List<Item> orderedItems = treeService.transformToListLevelOrder(trees);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvService.convertAllItemsToCsv(orderedItems));
    }

}
