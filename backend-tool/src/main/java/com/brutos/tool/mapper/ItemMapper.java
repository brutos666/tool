package com.brutos.tool.mapper;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.exception.InvalidModelValueException;
import com.brutos.tool.handler.webResult.ItemWebResult;
import com.brutos.tool.model.ItemModel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class ItemMapper implements Mapper<Item, ItemModel, ItemWebResult> {
    @Override
    public ItemWebResult toWebResult(Item item) {
        return new ItemWebResult(item.getId(), item.getTitle(), item.getText(), item.getState());
    }

    @Override
    public Item toEntity(ItemWebResult webResult) {
        Item item = new Item();
        item.setId(webResult.getId());
        item.setTitle(webResult.getTitle());
        item.setText(webResult.getText());
        item.setState(webResult.getState());
        return item;
    }

    @Override
    public List<ItemWebResult> toWebResult(List<Item> items) {
        return items.stream().map(this::toWebResult).toList();
    }

    @Override
    public ItemModel toModel(Item item) {
        ItemModel itemModel = new ItemModel();
        itemModel.setId(item.getId());
        itemModel.setTitle(item.getTitle());
        itemModel.setText(item.getText());
        itemModel.setState(item.getState().name());
        return itemModel;
    }

    @Override
    public List<ItemModel> toModel(List<Item> items) {
        return items.stream().map(this::toModel).toList();
    }

    @Override
    public Item toEntity(ItemModel itemModel) {
        Item item = new Item();
        item.setId(itemModel.getId());
        item.setTitle(itemModel.getTitle());
        item.setText(itemModel.getText());
        if (itemModel.getState() != null) {
            Optional<State> optionalState = State.convertStringToEnum(itemModel.getState());
            optionalState.ifPresentOrElse(item::setState, () -> {
                throw new InvalidModelValueException("state (État de l'item)", itemModel.getState(), "TODO, IN_PROGESS, DONE");
            });
        }
        return item;
    }

    @Override
    public List<Item> toEntity(Iterable<ItemModel> itemModels) {
        List<Item> items = new ArrayList<>();
        itemModels.forEach(itemModel -> items.add(this.toEntity(itemModel)));
        return items;
    }

}
