package com.brutos.tool.mapper;

import com.brutos.tool.entity.TreeInfos;
import com.brutos.tool.handler.webResult.ItemToSaveWebResult;

public class ItemToSaveMapper {

    public static TreeInfos toEntity(ItemToSaveWebResult webResult) {
        return new TreeInfos(ItemMapper.toTreeEntity(webResult.getItem()),
                webResult.getPreviousItemId(),
                webResult.getParentId(),
                webResult.getNextItemId());
    }

    public static ItemToSaveWebResult toWebResult(TreeInfos entity) {
        return new ItemToSaveWebResult(ItemMapper.toWebResult(entity.getTreeItem()),
                entity.getPreviousItemId(),
                entity.getParentItemId(),
                entity.getNextItemId());
    }
}
