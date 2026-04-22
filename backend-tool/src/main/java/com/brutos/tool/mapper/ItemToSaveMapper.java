package com.brutos.tool.mapper;

import com.brutos.tool.entity.TreeInfos;
import com.brutos.tool.handler.webResult.ItemToSaveWebResult;

public class ItemToSaveMapper {

    public static TreeInfos toEntity(ItemToSaveWebResult webResult) {
        return new TreeInfos(ItemMapper.toTreeEntity(webResult.getItem()),
                ItemMapper.toEntity(webResult.getPreviousItem()),
                webResult.getParentId(),
                webResult.getNextItemId());
    }

    public static ItemToSaveWebResult toWebResult(TreeInfos entity) {
        return new ItemToSaveWebResult(ItemMapper.toWebResult(entity.getTreeItem()),
                ItemMapper.toWebResult(entity.getPreviousItem()),
                entity.getParentId(),
                entity.getNextItemId());
    }
}
