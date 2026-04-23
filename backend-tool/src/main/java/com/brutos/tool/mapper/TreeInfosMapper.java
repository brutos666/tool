package com.brutos.tool.mapper;

import com.brutos.tool.entity.TreeInfos;
import com.brutos.tool.handler.webResult.TreeInfosWebResult;

public class TreeInfosMapper {

    public static TreeInfos toEntity(TreeInfosWebResult webResult) {
        return new TreeInfos(ItemMapper.toTreeEntity(webResult.getItem()),
                webResult.getPreviousItemId(),
                webResult.getParentItemId(),
                webResult.getNextItemId());
    }

    public static TreeInfosWebResult toWebResult(TreeInfos entity) {
        return new TreeInfosWebResult(ItemMapper.toWebResult(entity.getTreeItem()),
                entity.getPreviousItemId(),
                entity.getParentItemId(),
                entity.getNextItemId());
    }
}
