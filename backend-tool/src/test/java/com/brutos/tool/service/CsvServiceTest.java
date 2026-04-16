package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.mapper.ItemMapper;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class CsvServiceTest {
    @Mock
    private ItemMapper itemMapper;
    private CsvService csvService;

    @BeforeEach
    public void setUp() {
        itemMapper = new ItemMapper();
        csvService = new CsvService(itemMapper);
    }

    @Test
    public void convertAllItemsToCsv_shouldReturnCsvString() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException {
        // Given
        Item item = new Item();
        item.setId(88L);
        item.setTitle("Liste de vacances");
        item.setText("Check list");
        item.setState(State.TODO);
        item.setParentId(-1L);
        item.setNextId(102L);
        Item item2 = new Item();
        item2.setId(102L);
        item2.setTitle("Todo liste");
        item2.setText("");
        item2.setState(State.DONE);
        item2.setParentId(-1L);
        item2.setNextId(null);
        List<Item> itemModels = new ArrayList<>();
        itemModels.add(item);
        itemModels.add(item2);

        // When
        String result = csvService.convertAllItemsToCsv(itemModels);

        // Then
        // On ne sait pas dans quelle
        assertEquals("\"ID\";\"NEXTID\";\"PARENTID\";\"STATE\";\"TEXT\";\"TITLE\"\n" +
                "\"88\";\"102\";\"-1\";\"TODO\";\"Check list\";\"Liste de vacances\"\n" +
                "\"102\";\"\";\"-1\";\"DONE\";\"\";\"Todo liste\"\n", result);
    }

    @Test
    public void convertCsvToItems_shouldReturnList() throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException, IOException {
        // Given
        String csv = "\"ID\";\"NEXTID\";\"PARENTID\";\"STATE\";\"TEXT\";\"TITLE\"\n" +
                "\"88\";\"102\";\"-1\";\"TODO\";\"Check list\";\"Liste de vacances\"\n" +
                "\"102\";\"\";\"-1\";\"DONE\";\"\";\"Todo liste\"\n";

        // When
        List<Item> result = csvService.convertCsvToItems(new MockMultipartFile("test.csv", csv.getBytes()));

        // Then
        Item expectedItem1 = new Item();
        expectedItem1.setId(88L);
        expectedItem1.setTitle("Liste de vacances");
        expectedItem1.setText("Check list");
        expectedItem1.setState(State.TODO);
        expectedItem1.setParentId(-1L);
        expectedItem1.setNextId(102L);
        Item expectedItem2 = new Item();
        expectedItem2.setId(102L);
        expectedItem2.setTitle("Todo liste");
        expectedItem2.setText("");
        expectedItem2.setState(State.DONE);
        expectedItem2.setParentId(-1L);
        expectedItem2.setNextId(null);
        List<Item> expected = new ArrayList<>();
        expected.add(expectedItem1);
        expected.add(expectedItem2);
        assertEquals(expected, result);
    }

}