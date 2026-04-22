package com.brutos.tool.controller;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.service.CsvService;
import com.brutos.tool.service.ItemService;
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

    // @Autowired
    public ExportController(CsvService csvService, ItemService itemService) {
        this.csvService = csvService;
        this.itemService = itemService;
    }

    @GetMapping("/allItems")
    public ResponseEntity<String> findAllItems() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException {
        List<Tree<Item>> trees = itemService.getAllItems();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvService.convertAllItemsToCsv(trees));
    }

}
