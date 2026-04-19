package com.brutos.tool.mapper;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.State;
import com.brutos.tool.entity.Tree;
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
        ItemWebResult itemWebResult = new ItemWebResult();
        itemWebResult.setId(item.getId());
        itemWebResult.setTitle(item.getTitle());
        itemWebResult.setText(item.getText());
        itemWebResult.setState(item.getState());
        itemWebResult.setParentId(item.getParentId());
        itemWebResult.setNextId(item.getNextId());
        itemWebResult.setStatus(item.getStatus());
        return itemWebResult;
    }

    @Override
    public Item toEntity(ItemWebResult webResult) {
        Item item = new Item();
        item.setId(webResult.getId());
        item.setTitle(webResult.getTitle());
        item.setText(webResult.getText());
        item.setState(webResult.getState());
        item.setParentId(webResult.getParentId());
        item.setNextId(webResult.getNextId());
        item.setStatus(webResult.getStatus());
        return item;
    }

    public Tree<Item> toTreeEntity(ItemWebResult webResult) {
        Item item = toEntity(webResult);
        Tree<Item> treeItem = new Tree<>(item);
        if (webResult.getChildren() != null) {
            treeItem.setChildren(webResult.getChildren().stream().map(this::toTreeEntity).toList());
        }
        return treeItem;
    }

    @Override
    public List<ItemWebResult> toWebResult(List<Item> items) {
        return null;
    }

    public ItemWebResult toWebResult(Tree<Item> treeItem) {
        ItemWebResult itemWebResult = toWebResult(treeItem.getData());
        if (treeItem.getChildren() != null) {
            itemWebResult.setChildren(treeItem.getChildren().stream().map(this::toWebResult).toList());
        }
        return itemWebResult;
    }

    public List<ItemWebResult> treeToWebResult(List<Tree<Item>> trees) {
        // Pas de prise en compte des enfants
        return trees.stream().map(this::toWebResult).toList();
    }

    @Override
    public ItemModel toModel(Item item) {
        ItemModel itemModel = new ItemModel();
        itemModel.setId(item.getId());
        itemModel.setTitle(item.getTitle());
        itemModel.setText(item.getText());
        itemModel.setState(item.getState().name());
        itemModel.setParentId(item.getParentId());
        itemModel.setNextId(item.getNextId());
        return itemModel;
    }

    @Override
    public List<ItemModel> toModel(List<Item> items) {
        return items.stream().map(this::toModel).toList();
    }

    public List<ItemModel> toModel(Tree<Item> treeItem) {
        List<ItemModel> itemModels = new ArrayList<>();
        itemModels.add(toModel(treeItem.getData()));
        if (treeItem.getChildren() != null) {
            treeItem.getChildren()
                    .forEach(tree -> itemModels.addAll(this.toModel(tree)));
        }
        return itemModels;
    }

    public List<ItemModel> treeToModel(List<Tree<Item>> treeItemsList) {
        List<ItemModel> itemModels = new ArrayList<>();
        treeItemsList.forEach(tree -> itemModels.addAll(this.toModel(tree)));
        return itemModels;
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
        item.setParentId(itemModel.getParentId());
        item.setNextId(itemModel.getNextId());
        return item;
    }

    @Override
    public List<Item> toEntity(Iterable<ItemModel> itemModels) {
        List<Item> items = new ArrayList<>();
        itemModels.forEach(itemModel -> items.add(this.toEntity(itemModel)));
        return items;
    }

}
