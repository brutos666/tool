package com.brutos.tool.service;

import com.brutos.tool.entity.CRUDMode;
import com.brutos.tool.entity.Item;
import com.brutos.tool.entity.Tree;
import com.brutos.tool.entity.TreeInfos;
import com.brutos.tool.mapper.ItemMapper;
import com.brutos.tool.model.ItemModel;
import com.brutos.tool.repository.ItemRepository;
import com.brutos.tool.utilities.TreeUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public Item setNullIds(Item item) {
        item.setId(null);
        item.setNextId(null);
        item.setParentId(null);
        item.setCRUDMode(CRUDMode.CREATE);
        return item;
    }

    public Item save(Item item) {
        ItemModel itemModel = itemRepository.save(ItemMapper.toModel(item));
        return ItemMapper.toEntity(itemModel);
    }

    public Optional<Item> getLastRootItem() {
        Optional<ItemModel> optionalPrevious = itemRepository.findFirstByParentIdAndNextIdIsNull(-1L);
        return optionalPrevious.map(ItemMapper::toEntity);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Item> saveTreeItemOptimized(Optional<Item> previousItem, Long nextItemId, Tree<Item> treeItem) {
        // Traiter les suppressions et les créations en premiers
        List<Item> itemsToDelete = TreeUtils.applyFilter(treeItem, item -> item.getCRUDMode() == CRUDMode.DELETE);
        if (!itemsToDelete.isEmpty()) {
            itemRepository.deleteAll(ItemMapper.toModel(itemsToDelete));
        }
        List<Item> itemsToCreate = TreeUtils.applyFilter(treeItem, item -> item.getCRUDMode() == CRUDMode.CREATE);
        if (!itemsToCreate.isEmpty()) {
            Iterable<ItemModel> itemsCreated = itemRepository.saveAll(ItemMapper.toModel(itemsToCreate));
            updateTreeItemIds(itemsToCreate, itemsCreated);
        }
        // Parcours de l'arbre afin de fournir la liste des items à modifier, soit parce qu'ils sont modifiés,
        // soit parce que l'identifiant du suivant doit être mis à jour
        List<ItemModel> itemsToModify = getItemsToModify(previousItem, nextItemId, treeItem);

        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(itemsToModify);

        // TODO : retourner plutôt l'arbre modifié ou le résultat d'un select de la base de données
        return ItemMapper.toEntity(modifiedItems);
    }

    @Transactional
    public TreeInfos saveTreeItem(TreeInfos treeInfos) {

        Tree<Item> treeItem = treeInfos.getTreeItem();
        // Traiter les suppressions et les créations en premiers
        List<Item> itemsToDelete = TreeUtils.applyFilter(treeItem, item -> item.getCRUDMode() == CRUDMode.DELETE);
        if (!itemsToDelete.isEmpty()) {
            itemRepository.deleteAll(ItemMapper.toModel(itemsToDelete));
            TreeUtils.removeIf(treeItem, item -> item.getCRUDMode().isDelete());
        }
        List<Item> itemsToCreate = TreeUtils.applyFilter(treeItem, item -> item.getCRUDMode() == CRUDMode.CREATE);
        if (!itemsToCreate.isEmpty()) {
            Iterable<ItemModel> itemsCreated = itemRepository.saveAll(ItemMapper.toModel(itemsToCreate));
            updateTreeItemIds(itemsToCreate, itemsCreated);
        }
        // Parcours de l'arbre afin de fournir la liste des items : tous les items sont pris en compte même
        // s'il n'y a pas eu de modification
        Optional<Item> previousItem = treeInfos.getPreviousItem();
        List<ItemModel> itemsToModify = getAllItemsToModify(previousItem, treeInfos.getParentId(), treeInfos.getNextItemId(), treeItem);
        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(itemsToModify);

        Iterator<ItemModel> iterator = modifiedItems.iterator();
        Item savedPreviousItem = null;
        List<Item> items = new ArrayList<>();
        if (previousItem.isPresent()) {
            savedPreviousItem = ItemMapper.toEntity(iterator.next());
        }
        iterator.forEachRemaining(itemModel -> items.add(ItemMapper.toEntity(itemModel)));
        Tree<Item> savedTreeItem = TreeUtils.transformToTree(items);
        return new TreeInfos(savedTreeItem, savedPreviousItem, treeInfos.getParentId(), treeInfos.getNextItemId());
    }

    /**
     * Sauvegarde d'une liste d'arbre
     *
     * @param treeInfosList : liste des items à sauvegarder
     * @return la liste des items sauvegardés
     */
    @Transactional
    public List<TreeInfos> saveTreeItemList(List<TreeInfos> treeInfosList) {
        List<Tree<Item>> treeItemsList = treeInfosList.stream().map(TreeInfos::getTreeItem).toList();
        List<Item> allItems = TreeUtils.transformToListDepthFirst(treeItemsList);
        // Traiter les suppressions et les créations en premiers
        List<Item> itemsToDelete = allItems.stream().filter(item -> item.getCRUDMode().isDelete()).toList();
        if (!itemsToDelete.isEmpty()) {
            itemRepository.deleteAll(ItemMapper.toModel(itemsToDelete));
        }
        List<Item> itemsToCreate = allItems.stream().filter(item -> item.getCRUDMode().isCreate()).toList();
        if (!itemsToCreate.isEmpty()) {
            Iterable<ItemModel> itemsCreated = itemRepository.saveAll(ItemMapper.toModel(itemsToCreate));
            updateTreeItemIds(itemsToCreate, itemsCreated);
        }
        // Constitution de la liste de tous les items à modifier
        List<Integer> numberOfItems = new ArrayList<>(treeInfosList.size());
        List<ItemModel> allItemsToModify = new ArrayList<>();
        // Traiter tous les éléments afin de prendre en compte les modifications et mettre à jour les identifiants
        for (TreeInfos treeInfos : treeInfosList) {
            List<ItemModel> itemsToModify = getAllItemsToModify(treeInfos, treeInfosList);
            numberOfItems.add(itemsToModify.size());
            allItemsToModify.addAll(itemsToModify);
        }

        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(allItemsToModify);

        // Constitution du résultat
        return getSavedTrees(modifiedItems, numberOfItems, treeInfosList);
    }

    /**
     * Création d'une liste d'arbre qui se suivent
     *
     * @param previousItem  : item précédent
     * @param parentId      : identifiant du parent
     * @param treeItemsList : liste des arbres des items à créer
     * @return liste des items créés
     */
    @Transactional(rollbackFor = Exception.class)
    public List<Item> createTreeItems(Optional<Item> previousItem, Long parentId, List<Tree<Item>> treeItemsList) {
        List<Item> itemsToCreate = TreeUtils.transformToListDepthFirst(treeItemsList);
        Iterable<ItemModel> itemsCreated = itemRepository.saveAll(ItemMapper.toModel(itemsToCreate));
        updateTreeItemIds(itemsToCreate, itemsCreated);

        Tree<Item> firstTree = treeItemsList.getFirst();
        List<ItemModel> itemsToModify = new ArrayList<>();
        for (Tree<Item> treeItem : treeItemsList) {
            Long nextChildId = getNext(treeItem, treeItemsList).map(Item::getId).orElse(null);
            itemsToModify.addAll(treeItem == firstTree ?
                    getAllItemsToModify(previousItem, parentId, nextChildId, treeItem) :
                    getAllItemsToModify(parentId, nextChildId, treeItem));
        }

        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(itemsToModify);

        return ItemMapper.toEntity(modifiedItems);
    }

    public List<Item> getAllItems() {
        return ItemMapper.toEntity(itemRepository.findAll());
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

    /**
     * Mis à jour des identifiants dans l'arbre
     *
     * @param itemsToCreate : Liste des items à créer
     * @param createdItems  : Liste des items créés
     */
    private void updateTreeItemIds(List<Item> itemsToCreate, Iterable<ItemModel> createdItems) {
        Iterator<ItemModel> createdItemsIterator = createdItems.iterator();
        itemsToCreate.forEach(item -> item.setId(createdItemsIterator.next().getId()));
    }

    private List<ItemModel> getItemsToModify(Optional<Item> previousItem, Long nextItemId, Tree<Item> treeItem) {
        // Parcours de l'arbre afin de fournir la liste des items à modifier, soit parce qu'ils sont modifiés,
        // soit parce que l'identifiant du suivant doit être mis à jour
        List<ItemModel> itemsToModify = getItemsToModify(treeItem);

        Item rootItem = treeItem.getData();
        CRUDMode rootCRUDMode = rootItem.getCRUDMode();
        if (!rootCRUDMode.isRead()) {
            // Si la racine est mise à jour, son suivant doit correctement être affecté
            ItemModel rootItemModel = itemsToModify.getFirst();
            rootItemModel.setNextId(nextItemId);
        }

        boolean modifyPrevious = previousItem.isPresent() && (rootCRUDMode.isDelete() || rootCRUDMode.isCreate());
        if (modifyPrevious) {
            // Si la racine est créée ou supprimée, le suivant du précédent doit être mis à jour
            itemsToModify.addFirst(getPreviousToSave(rootItem, previousItem.get(), nextItemId));
        }

        return itemsToModify;
    }

    /**
     * Récupère la liste des items modifiés.
     * Les items considérés comme modifiés sont :
     * - les items qui sont nouvellement créés : il faut mettre à jour les identifiants parents et suivants
     * - les items qui sont à l'état modifié
     * - les items qui ont été déplacé (état MOVE).
     * - les items dont le suivant a été créé, déplacé ou supprimé
     *
     * @param treeItem : arbre des items
     * @return : liste des items modifiés
     */
    private List<ItemModel> getItemsToModify(Tree<Item> treeItem) {
        List<ItemModel> itemsToUpdate = new ArrayList<>();
        Item parentItem = treeItem.getData();
        CRUDMode crudMode = parentItem.getCRUDMode();
        if (crudMode.isCreate() || crudMode.isUpdate() || crudMode.isMove()) {
            itemsToUpdate.add(ItemMapper.toModel(parentItem));
        }
        Item previousItem = null;
        for (Tree<Item> child : treeItem.getChildren()) {
            Item childItem = child.getData();
            CRUDMode childCRUDMode = childItem.getCRUDMode();
            if (childCRUDMode.isDelete()) {
                continue;
            }
            childItem.setParentId(parentItem.getId());
            addUpdatePreviousModel(previousItem, childItem.getId(), itemsToUpdate);
            itemsToUpdate.addAll(getItemsToModify(child));
            previousItem = childItem;
        }
        if (previousItem != null) {
            // Traiter le précédent ici lorsque les suivants de ce dernier ont tous été supprimés
            Item lastChildItem = treeItem.getChildren().getLast().getData();
            if (lastChildItem.getCRUDMode().isDelete()) {
                addUpdatePreviousModel(previousItem, null, itemsToUpdate);
            }
        }
        return itemsToUpdate;
    }

    private void addUpdatePreviousModel(Item previousItem, Long nextItemId, List<ItemModel> itemsToUpdate) {
        if (previousItem == null) {
            return;
        }
        // S'il n'a pas été ajouté à la liste, il faut le faire
        CRUDMode previousCrudMode = previousItem.getCRUDMode();
        if (previousCrudMode.isRead()) {
            itemsToUpdate.add(ItemMapper.toModel(previousItem));
        }
        // MAJ de l'identifiant du suivant pour l'item précédent
        ItemModel previousModel = itemsToUpdate.getLast();
        previousModel.setNextId(nextItemId);
    }

    private List<ItemModel> getAllItemsToModify(TreeInfos treeInfos, List<TreeInfos> treeInfosList) {
        List<ItemModel> itemsToModify = null;
        Long nextChildId = treeInfos.getNextItemId();
        if (nextFollow(treeInfos, treeInfosList)) {
            nextChildId = getNext(treeInfos, treeInfosList)
                    .map(next -> next.getTreeItem().getData().getId())
                    .orElse(null);
        }
        if (followPrevious(treeInfos, treeInfosList)) {
            itemsToModify = getAllItemsToModify(treeInfos.getParentId(), nextChildId, treeInfos.getTreeItem());
        } else {
            // Parcours de l'arbre afin de fournir la liste des items : tous les items sont pris en compte même
            // s'il n'y a pas eu de modification
            itemsToModify = getAllItemsToModify(treeInfos.getPreviousItem(),
                    treeInfos.getParentId(),
                    nextChildId,
                    treeInfos.getTreeItem());
        }
        return itemsToModify;
    }

    private List<ItemModel> getAllItemsToModify(Optional<Item> previousItem, Long parentId, Long nextItemId, Tree<Item> treeItem) {
        Item rootItem = treeItem.getData();
        List<ItemModel> itemsToModify = getAllItemsToModify(parentId, nextItemId, treeItem);
        previousItem.ifPresent(item -> itemsToModify.addFirst(getPreviousToSave(rootItem, item, nextItemId)));
        return itemsToModify;
    }

    private List<ItemModel> getAllItemsToModify(Long parentId, Long nextId, Tree<Item> treeItem) {
        List<ItemModel> itemsToModify = new ArrayList<>();
        Item item = treeItem.getData();
        ItemModel itemModel = ItemMapper.toModel(item);
        itemModel.setParentId(parentId);
        itemModel.setNextId(nextId);
        itemsToModify.add(itemModel);

        List<Tree<Item>> children = treeItem.getChildren();
        for (Tree<Item> child : children) {
            Long nextChildId = getNext(child, children).map(Item::getId).orElse(null);
            itemsToModify.addAll(getAllItemsToModify(item.getId(), nextChildId, child));
        }
        return itemsToModify;
    }

    private ItemModel getPreviousToSave(Item item, Item previous, Long nextItemId) {
        Long previousNextId = item.getCRUDMode().isDelete() ? nextItemId : item.getId();
        ItemModel previousModel = ItemMapper.toModel(previous);
        previousModel.setNextId(previousNextId);
        return previousModel;
    }

    private Optional<Item> getNext(Tree<Item> treeItem, List<Tree<Item>> treeItemList) {
        if (treeItem == treeItemList.getLast()) {
            return Optional.empty();
        }
        int index = treeItemList.indexOf(treeItem);
        return Optional.of(treeItemList.get(index + 1).getData());
    }

    private Optional<TreeInfos> getNext(TreeInfos treeItem, List<TreeInfos> treeItemList) {
        if (treeItem == treeItemList.getLast()) {
            return Optional.empty();
        }
        int index = treeItemList.indexOf(treeItem);
        return Optional.of(treeItemList.get(index + 1));
    }

    private boolean nextFollow(TreeInfos treeInfos, List<TreeInfos> treeInfosList) {
        Optional<TreeInfos> optionalNextItemToSave = getNext(treeInfos, treeInfosList);
        if (optionalNextItemToSave.isEmpty()) {
            return false;
        }
        Item item = treeInfos.getTreeItem().getData();
        TreeInfos nextTreeInfos = optionalNextItemToSave.get();
        return isFollow(nextTreeInfos, item);
    }

    private boolean followPrevious(TreeInfos treeInfos, List<TreeInfos> treeInfosList) {
        if (treeInfosList.size() == 1) {
            return false;
        }
        TreeInfos previous = treeInfosList.get(treeInfosList.size() - 2);
        return isFollow(treeInfos, previous.getTreeItem().getData());
    }

    private boolean isFollow(TreeInfos treeInfos, Item item) {
        if (treeInfos.previousIsNew() && item.getCRUDMode().isCreate() ||
                treeInfos.previousIsDelete() && item.getCRUDMode().isDelete()) {
            // Si le suivant est en création ou suppression, on peut considérer que les items se suivent
            return true;
        }
        // Dans les autres cas, les identifiants sont connus, on peut les vérifier
        if (treeInfos.getPreviousItem().isPresent()) {
            Long previousId = item.getId();
            return treeInfos.getPreviousItem().get().getId().equals(previousId);
        }
        return false;
    }

    /**
     * Constitution du résultat à partir des items modifiées et de la liste des items à sauvegarder
     *
     * @param modifiedItems : items modifiés
     * @param numberOfItems : nombre d'items modifiés pour chaque arbre à sauvegarder
     * @param treeInfosList : liste des arbres à sauvegarder
     * @return la liste des arbres sauvegardés
     */
    private List<TreeInfos> getSavedTrees(Iterable<ItemModel> modifiedItems, List<Integer> numberOfItems, List<TreeInfos> treeInfosList) {
        // Constitution du résultat
        Iterator<ItemModel> iterator = modifiedItems.iterator();
        List<TreeInfos> savedItemsList = new ArrayList<>();
        int index = 0;
        for (TreeInfos treeInfos : treeInfosList) {
            int expectedSize = numberOfItems.get(index);
            Item savedPreviousItem = null;
            if (!followPrevious(treeInfos, treeInfosList)) {
                if (treeInfos.getPreviousItem().isPresent()) {
                    savedPreviousItem = ItemMapper.toEntity(iterator.next());
                    expectedSize--;
                }
            }

            List<Item> items = new ArrayList<>();
            while (items.size() < expectedSize) {
                items.add(ItemMapper.toEntity(iterator.next()));
            }
            Tree<Item> savedTreeItem = TreeUtils.transformToTree(items);
            savedItemsList.add(new TreeInfos(savedTreeItem, savedPreviousItem, treeInfos.getParentId(), treeInfos.getNextItemId()));
            index++;
        }
        return savedItemsList;
    }

}
