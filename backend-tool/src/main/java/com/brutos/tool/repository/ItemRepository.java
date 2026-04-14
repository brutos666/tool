package com.brutos.tool.repository;

import com.brutos.tool.model.ItemModel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends CrudRepository<ItemModel, Long> {
    // Recherche de l'item precedent l'item ayant l'id donné
    Optional<ItemModel> findFirstByParentIdAndNextId(Long parentId, Long Id);

    // Recherche parmi les items ayant pour parent l'id donné celui qui a nextId à null (le dernier)
    Optional<ItemModel> findFirstByParentIdAndNextIdIsNull(Long parentId);
}
