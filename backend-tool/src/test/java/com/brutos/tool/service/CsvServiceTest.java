package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Tree;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class CsvServiceTest {
    private final CsvService csvService = new CsvService();

    @Test
    public void convertAllItemsToCsv_shouldReturnCsvString() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException {
        // Given
        Item item = new Item(88L, "Liste de vacances", "Check list", State.TODO, -1L);
        Item item2 = new Item(102L, "Todo liste", "", State.DONE, -1L);
        Tree<Item> treeItem = new Tree<>(item);
        Tree<Item> treeItem2 = new Tree<>(item2);

        // When
        String result = csvService.convertAllItemsToCsv(List.of(treeItem, treeItem2));

        // Then
        // On ne sait pas dans quelle
        assertEquals("""
                "ID";"NEXTID";"PARENTID";"STATE";"TEXT";"TITLE"
                "88";"102";"-1";"TODO";"Check list";"Liste de vacances"
                "102";"";"-1";"DONE";"";"Todo liste"
                """, result);
    }

    @Test
    public void convertCsvToItems_shouldReturnList() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException, IOException {
        // Given
        String csv = """
                "ID";"NEXTID";"PARENTID";"STATE";"TEXT";"TITLE"
                "88";"102";"-1";"TODO";"Check list";"Liste de vacances"
                "102";"";"-1";"DONE";"";"Todo liste"
                """;

        // When
        List<Tree<Item>> result = csvService.convertCsvToItems(new MockMultipartFile("test.csv", csv.getBytes()));

        // Then
        Item expectedItem1 = new Item(88L, "Liste de vacances", "Check list", State.TODO, -1L);
        Item expectedItem2 = new Item(102L, "Todo liste", "", State.DONE, -1L);
        List<Tree<Item>> expected = new ArrayList<>();
        expected.add(new Tree<>(expectedItem1));
        expected.add(new Tree<>(expectedItem2));
        assertEquals(expected, result);
    }

}