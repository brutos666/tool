package com.brutos.tool.service;

import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    public ItemService(ItemRepository itemRepository, ItemMapper itemMapper) {
        this.itemRepository = itemRepository;
        this.itemMapper = itemMapper;
    }

    public Item setNullIds(Item item) {
        item.setId(null);
        item.setNextId(null);
        item.setParentId(null);
        return item;
    }

    public Item save(Item item) {
        ItemModel itemModel = itemRepository.save(itemMapper.toModel(item));
        return itemMapper.toEntity(itemModel);
    }

    public Optional<Item> getLastRootItem() {
        Optional<ItemModel> optionalPrevious = itemRepository.findFirstByParentIdAndNextIdIsNull(-1L);
        return optionalPrevious.map(itemMapper::toEntity);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Item> saveTreeItemsTest(Optional<Item> lastItem, List<Tree<Item>> treeItemsList) {
        ItemModel itemModel = new ItemModel(9999L, "A SUPPRIMER", "", "TODO", -1L, null);
        List<ItemModel> items = new ArrayList<>();
        items.add(itemModel);
        Iterable<ItemModel> savedItemsModel = itemRepository.saveAll(items);
        List<ItemModel> savedItems = new ArrayList<>();
        savedItemsModel.forEach(savedItems::add);

        savedItems.add(itemModel);
        savedItemsModel = itemRepository.saveAll(savedItems);
        return itemMapper.toEntity(savedItemsModel);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Item> saveTreeItems(Optional<Item> lastItem, List<Tree<Item>> treeItemsList) {
        List<ItemModel> itemsModel = itemMapper.treeToModel(treeItemsList);
        Iterable<ItemModel> savedItemsModel = itemRepository.saveAll(itemsModel);
        List<ItemModel> savedItems = new ArrayList<>();
        savedItemsModel.forEach(savedItems::add);

        updateIds(treeItemsList, savedItems);
        updatePreviousNext(lastItem, savedItems);

        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(savedItems);

        return itemMapper.toEntity(modifiedItems);
    }

    public List<Item> getAllItems() {
        return itemMapper.toEntity(itemRepository.findAll());
    }

    public void deleteItem(Item item) {
        // Recherche de l'item précédent
        Optional<ItemModel> previousItem = itemRepository.findFirstByParentIdAndNextId(item.getParentId(), item.getId());
        if (previousItem.isPresent()) {
            // Recherche de l'item suivant
            previousItem.get().setNextId(item.getNextId());
            itemRepository.save(previousItem.get());
        }
        itemRepository.deleteById(item.getId());
        for (Item child : item.getChildren()) {
            deleteItem(child);
        }
    }

    public void controlItem(Item item) {
        if (item.getId() == null) {
            throw new IllegalArgumentException("id (ID de la tâche) est obligatoire");
        }
    }

    private void updateIds(List<Tree<Item>> treeItemsList, List<ItemModel> savedItems) {
        Item lastChild = treeItemsList.getLast().getData();
        int modeleIndex = 0;
        ItemModel currentModel = null;
        for (Tree<Item> tree : treeItemsList) {
            Item item = tree.getData();
            currentModel = savedItems.get(modeleIndex);
            modeleIndex = updateIds(modeleIndex, savedItems, tree, -1L);
            currentModel.setNextId(item == lastChild ? null : savedItems.get(modeleIndex).getId());
        }
    }

    /**
     * Modification des identifiants des modèles et des items en parcourant l'arbre d'origine
     * et la liste des modèles via un index
     *
     * @param modeleIndex : index de parcours des modèles
     * @param itemsModel  : Liste des modèles
     * @param treeItem    : Arbre des items
     * @param parentId    : identifiant du parent à affecter au modèle à la position index
     * @return : index de parcours des modèles
     */
    private int updateIds(int modeleIndex, List<ItemModel> itemsModel, Tree<Item> treeItem, Long parentId) {
        ItemModel itemModel = itemsModel.get(modeleIndex);
        itemModel.setParentId(parentId);
        modeleIndex++;
        if (treeItem.getChildren().isEmpty()) {
            return modeleIndex;
        }
        ItemModel childModel = null;
        Item lastChild = treeItem.getChildren().getLast().getData();
        for (Tree<Item> childTreeItem : treeItem.getChildren()) {
            Item childItem = childTreeItem.getData();
            childModel = itemsModel.get(modeleIndex);
            modeleIndex = updateIds(modeleIndex, itemsModel, childTreeItem, itemModel.getId());
            childModel.setNextId(childItem == lastChild ? null : itemsModel.get(modeleIndex).getId());
        }
        return modeleIndex;
    }

    private void updatePreviousNext(Optional<Item> optionalPrevious, List<ItemModel> savedItems) {
        if (optionalPrevious.isEmpty()) {
            return;
        }
        // Récupérer le dernier item ayant -1 comme parentId et modifier son nextId avant
        // l'identifiant du premier des items ajoutés
        ItemModel previous = itemMapper.toModel(optionalPrevious.get());
        previous.setNextId(savedItems.getFirst().getId());
        savedItems.addFirst(previous);
    }

}
