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
        item.setParentId(null);
        item.setCRUDMode(CRUDMode.CREATE);
        return item;
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
        // Parcours de l'arbre afin de fournir la liste des itemModels : tous les itemModels sont pris en compte même
        // s'il n'y a pas eu de modification
        List<ItemModel> itemsToModify = getAllItemsToModify(treeInfos);
        if (treeInfos.getPreviousItemId() != null) {
            addFirstPrevious(treeInfos, itemsToModify);
        }
        Iterable<ItemModel> modifiedItems = itemRepository.saveAll(itemsToModify);
        Iterator<ItemModel> iterator = modifiedItems.iterator();
        if (treeInfos.getPreviousItemId() != null) {
            // Retirer le précédent de la liste
            removeFirstPrevious(iterator);
        }

        List<ItemModel> itemModels = new ArrayList<>();
        iterator.forEachRemaining(itemModels::add);
        Tree<Item> savedTreeItem = TreeUtils.transformToTree(itemModels, ItemMapper::toEntity);
        return new TreeInfos(savedTreeItem, treeInfos.getPreviousItemId(), treeInfos.getParentItemId(), treeInfos.getNextItemId());
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
        updateNextIds(treeInfosList);

        // Constitution de la liste de tous les items à modifier
        List<Integer> numberOfItems = new ArrayList<>(treeInfosList.size());
        List<ItemModel> allItemsToModify = new ArrayList<>();
        // Traiter tous les éléments afin de prendre en compte les modifications et mettre à jour les identifiants
        for (TreeInfos treeInfos : treeInfosList) {
            //List<ItemModel> itemsToModify = getAllItemsToModify(treeInfos, treeInfosList);
            List<ItemModel> itemsToModify = getAllItemsToModify(treeInfos);
            if (treeInfos.getPreviousItemId() != null) {
                addFirstPrevious(treeInfos, itemsToModify);
            }
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
    public List<Tree<Item>> createTreeItems(Optional<Item> previousItem, Long parentId, List<Tree<Item>> treeItemsList) {
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
        return TreeUtils.transformToTrees(modifiedItems, ItemMapper::toEntity);
    }

    public List<Tree<Item>> getAllItems() {
        Iterable<ItemModel> itemsModel = itemRepository.findAll();
        return TreeUtils.transformToTrees(itemsModel, ItemMapper::toEntity);
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

    private void updateNextIds(List<TreeInfos> treeInfosList) {
        // Pour un même parent, un précédent null est soit le 1er, soit un item venant d'être créé
        // Pour un même parent un suivant null est soit le dernier, soit un item venant d'être créé
        // Un précédent et un suivant connu peuvent avoir été supprimés
        //
        // Cette algo a pour but de passer les précédents déjà traités à null pour tout ce qui a été sauvegardé
        // (pour ne pas les traiter plusieurs fois) et de mettre à jour les suivants pour les items sauvegardés

        for (TreeInfos treeInfos : treeInfosList) {
            Optional<TreeInfos> next = getNextSameParent(treeInfos, treeInfosList);
            if (next.isEmpty()) {
                continue;
            }
            Item item = treeInfos.getTreeItem().getData();
            CRUDMode itemCRUDMode = item.getCRUDMode();
            TreeInfos nextTreeInfos = next.get();
            if (itemCRUDMode.isDelete()) {
                // L'item est supprimé : report du précédent sur l'item suivant
                nextTreeInfos.setPreviousItemId(treeInfos.getPreviousItemId());
                continue;
            }
            Item nextItem = nextTreeInfos.getTreeItem().getData();
            CRUDMode nextCRUDMode = nextItem.getCRUDMode();
            if (nextCRUDMode.isDelete()) {
                continue;
            }

            if (treeInfos.getNextItemId() == null && nextCRUDMode.isCreate()) {
                // Le suivant est un item qui vient d'être créé
                // => mis à jour de l'identifiant du suivant, suppression de l'identifiant du précédent
                treeInfos.setNextItemId(nextItem.getId());
                nextTreeInfos.setPreviousItemId(null);
                continue;
            }
            Long nextPreviousId = nextTreeInfos.getPreviousItemId();
            if (nextPreviousId == null && itemCRUDMode.isCreate()) {
                // Le précédent est un item qui vient d'être créé
                // => mis à jour du suivant
                treeInfos.setNextItemId(nextItem.getId());
                continue;
            }
            if (treeInfos.getNextItemId() != null && nextTreeInfos.getPreviousItemId() != null
                    && treeInfos.getNextItemId().equals(nextTreeInfos.getPreviousItemId())) {
                // Les identifiants correspondent, mais il ne faut pas traiter le précédent 2 fois
                nextTreeInfos.setPreviousItemId(null);
            }

        }

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
            itemsToUpdate.add(ItemMapper.toModel(parentItem, null));
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
            itemsToUpdate.add(ItemMapper.toModel(previousItem, nextItemId));
        }
        // MAJ de l'identifiant du suivant pour l'item précédent
        ItemModel previousModel = itemsToUpdate.getLast();
        previousModel.setNextId(nextItemId);
    }

    private List<ItemModel> getAllItemsToModify(TreeInfos treeInfos) {
        Tree<Item> treeItem = treeInfos.getTreeItem();
        Long nextItemId = treeInfos.getNextItemId();
        return TreeUtils.transformToChain(treeItem, treeInfos.getParentItemId(), nextItemId, ItemMapper::toModel);
    }

    private void addFirstPrevious(TreeInfos treeInfos, List<ItemModel> itemsToModify) {
        Tree<Item> treeItem = treeInfos.getTreeItem();
        Item rootItem = treeItem.getData();
        Long nextItemId = treeInfos.getNextItemId();
        // Si l'identifiant du précédent est fourni, le mettre à jour avec les autres
        itemRepository.findById(treeInfos.getPreviousItemId()).ifPresent(previousModel -> {
            Long nextId = rootItem.getCRUDMode().isDelete() ? nextItemId : rootItem.getId();
            previousModel.setNextId(nextId);
            itemsToModify.addFirst(previousModel);
        });
    }

    private void removeFirstPrevious(Iterator<ItemModel> iterator) {
        iterator.next();
    }

    private List<ItemModel> getAllItemsToModify(Optional<Item> previousItem, Long parentId, Long nextItemId, Tree<Item> treeItem) {
        Item rootItem = treeItem.getData();
        List<ItemModel> itemsToModify = TreeUtils.transformToChain(treeItem, parentId, nextItemId, ItemMapper::toModel);
        previousItem.ifPresent(item -> itemsToModify.addFirst(getPreviousToSave(rootItem, item, nextItemId)));
        return itemsToModify;
    }

    private List<ItemModel> getAllItemsToModify(Long parentId, Long nextId, Tree<Item> treeItem) {
        return TreeUtils.transformToChain(treeItem, parentId, nextId, ItemMapper::toModel);
    }

    private ItemModel getPreviousToSave(Item item, Item previous, Long nextItemId) {
        Long previousNextId = item.getCRUDMode().isDelete() ? nextItemId : item.getId();
        return ItemMapper.toModel(previous, previousNextId);
    }

    private Optional<Item> getNext(Tree<Item> treeItem, List<Tree<Item>> treeItemList) {
        if (treeItem == treeItemList.getLast()) {
            return Optional.empty();
        }
        int index = treeItemList.indexOf(treeItem);
        return Optional.of(treeItemList.get(index + 1).getData());
    }

    private Optional<TreeInfos> getNextSameParent(TreeInfos treeInfos, List<TreeInfos> treeItemList) {
        if (treeInfos == treeItemList.getLast()) {
            return Optional.empty();
        }
        int index = treeItemList.indexOf(treeInfos);
        return treeItemList.subList(index + 1, treeItemList.size())
                .stream()
                .filter(infos -> infos.getParentItemId().equals(treeInfos.getParentItemId()))
                .findFirst();
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
            if (treeInfos.getPreviousItemId() != null) {
                // Ne pas prendre en compte l'item précédent qui a été modifié
                iterator.next();
                expectedSize--;
            }

            List<ItemModel> itemModels = new ArrayList<>();
            while (itemModels.size() < expectedSize) {
                itemModels.add(iterator.next());
            }
            Tree<Item> savedTreeItem = TreeUtils.transformToTree(itemModels, ItemMapper::toEntity);
            savedItemsList.add(new TreeInfos(savedTreeItem, treeInfos.getPreviousItemId(), treeInfos.getParentItemId(), treeInfos.getNextItemId()));
            index++;
        }
        return savedItemsList;
    }

}
