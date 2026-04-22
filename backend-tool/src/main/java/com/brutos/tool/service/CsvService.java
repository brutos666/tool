package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.List;

@Service
public class CsvService {

    public String convertAllItemsToCsv(List<Item> items) throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException {
        List<ItemModel> itemsModel = ItemMapper.toModel(items);
        StringWriter writer = new StringWriter();
        StatefulBeanToCsv<ItemModel> beanToCsv = new StatefulBeanToCsvBuilder<ItemModel>(writer)
                .withSeparator(';') // utile en France
                .build();
        beanToCsv.write(itemsModel);
        return writer.toString();
    }

    public List<Item> convertCsvToItems(MultipartFile file) throws IOException {
        InputStreamReader reader = new InputStreamReader(file.getInputStream());

        CsvToBean<ItemModel> csvToBean = new CsvToBeanBuilder<ItemModel>(reader)
                .withType(ItemModel.class)
                .withSeparator(';') // important en France
                .withIgnoreLeadingWhiteSpace(true)
                .build();
        return ItemMapper.toEntity(csvToBean.parse());
    }
}
