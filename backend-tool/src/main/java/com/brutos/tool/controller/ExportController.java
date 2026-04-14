package com.brutos.tool.controller;

import com.brutos.tool.service.CsvService;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final CsvService csvService;

    // @Autowired
    public ExportController(CsvService csvService) {
        this.csvService = csvService;
    }

    @GetMapping("/allItems")
    public ResponseEntity<String> findAllItems() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvService.convertAllItemsToCsv());
    }

}
