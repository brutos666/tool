package com.brutos.tool.mapper;

import com.brutos.tool.entity.CRUDMode;
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
public class ItemMapper {
    public static ItemWebResult toWebResult(Optional<Item> item) {
        return item.map(ItemMapper::toWebResult).orElse(null);
    }

    public static ItemWebResult toWebResult(Item item) {
        if (item == null) {
            return null;
        }
        ItemWebResult itemWebResult = new ItemWebResult();
        itemWebResult.setId(item.getId());
        itemWebResult.setTitle(item.getTitle());
        itemWebResult.setText(item.getText());
        itemWebResult.setState(item.getState());
        itemWebResult.setParentId(item.getParentId());
        itemWebResult.setNextId(item.getNextId());
        itemWebResult.setStatus(item.getStatus());
        itemWebResult.setCRUDMode(item.getCRUDMode());
        return itemWebResult;
    }

    public static Item toEntity(ItemWebResult webResult) {
        if (webResult == null) {
            return null;
        }
        Item item = new Item();
        item.setId(webResult.getId());
        item.setTitle(webResult.getTitle());
        item.setText(webResult.getText());
        item.setState(webResult.getState());
        item.setParentId(webResult.getParentId());
        item.setNextId(webResult.getNextId());
        item.setStatus(webResult.getStatus());
        item.setCRUDMode(webResult.getCRUDMode());
        return item;
    }

    public static Tree<Item> toTreeEntity(ItemWebResult webResult) {
        Item item = toEntity(webResult);
        Tree<Item> treeItem = new Tree<>(item);
        if (webResult.getChildren() != null) {
            webResult.getChildren().forEach(child -> treeItem.addChild(toTreeEntity(child)));
        }
        return treeItem;
    }

    public static ItemWebResult toWebResult(Tree<Item> treeItem) {
        ItemWebResult itemWebResult = toWebResult(treeItem.getData());
        if (treeItem.getChildren() != null) {
            itemWebResult.setChildren(treeItem.getChildren().stream().map(ItemMapper::toWebResult).toList());
        }
        return itemWebResult;
    }

    public static List<ItemWebResult> treeToWebResult(List<Tree<Item>> trees) {
        // Pas de prise en compte des enfants
        return trees.stream().map(ItemMapper::toWebResult).toList();
    }

    public static ItemModel toModel(Item item) {
        ItemModel itemModel = new ItemModel();
        itemModel.setId(item.getId());
        itemModel.setTitle(item.getTitle());
        itemModel.setText(item.getText());
        itemModel.setState(item.getState().name());
        itemModel.setParentId(item.getParentId());
        itemModel.setNextId(item.getNextId());
        return itemModel;
    }

    public static List<ItemModel> toModel(List<Item> items) {
        return items.stream().map(ItemMapper::toModel).toList();
    }

    public static List<Item> toEntity(Iterable<ItemModel> itemModels) {
        List<Item> items = new ArrayList<>();
        itemModels.forEach(itemModel -> items.add(ItemMapper.toEntity(itemModel)));
        return items;
    }

    public static Item toEntity(ItemModel itemModel) {
        Item item = new Item();
        item.setId(itemModel.getId());
        item.setTitle(itemModel.getTitle());
        item.setText(itemModel.getText());
        if (itemModel.getState() != null) {
            Optional<State> optionalState = State.convertStringToEnum(itemModel.getState());
            optionalState.ifPresentOrElse(item::setState, () -> {
                throw new InvalidModelValueException("state (État de l'item)", itemModel.getState(), "TODO, IN_PROGRESS, DONE");
            });
        }
        item.setParentId(itemModel.getParentId());
        item.setNextId(itemModel.getNextId());
        item.setCRUDMode(CRUDMode.READ);
        return item;
    }

}
