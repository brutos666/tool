package com.brutos.tool.repository;

import com.brutos.tool.model.ItemModel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends CrudRepository<ItemModel, Long> {
}
