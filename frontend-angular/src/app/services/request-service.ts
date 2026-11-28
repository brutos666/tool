import { HttpClientCommonOptions, HttpContext } from '@angular/common/http';
import { NotificationMessage } from '../errors/notification-messages.js';
import { ErrorInterceptor } from '../errors/error-interceptor.js';
import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { TreeItemData } from '../data/tree-item-data.js';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';
import { TreeInfoData } from '../data/tree-info-data.js';
import { ItemService } from './item-service.js';
import { Service } from '@angular/core';

@Service()
export class RequestService {
  getJsonOptions(message: NotificationMessage) {
    return {
      context: new HttpContext().set(ErrorInterceptor.notificationMessage, message),
    };
  }
  getFileOptions(message: NotificationMessage): {
    responseType: 'blob';
  } & HttpClientCommonOptions {
    return {
      context: new HttpContext().set(ErrorInterceptor.notificationMessage, message),
      responseType: 'blob',
    };
  }
  async get<R>(request: Observable<R>): Promise<R> {
    return lastValueFrom(request);
  }

  convertTreeInfosDataToTreeItem(
    treeParentItemId: string,
    request: Observable<TreeInfoData>,
    giveIdCall: Function,
  ) {
    const mapRequest = request.pipe(
      catchError(() => []),
      map((treeInfoObj) => convertToTreeData(treeInfoObj.item, treeParentItemId, giveIdCall)),
    );
    return lastValueFrom(mapRequest);
  }

  convertToTreeItem(
    treeParentItemId: string,
    request: Observable<TreeItemData>,
    giveIdCall: Function,
  ) {
    const mapRequest = request.pipe(
      catchError(() => []),
      map((treeItemObj) => convertToTreeData(treeItemObj, treeParentItemId, giveIdCall)),
    );
    return lastValueFrom(mapRequest);
  }

  convertTreesToTreeItem(
    request: Observable<TreeItemData[]>,
    giveIdCall: Function,
  ): Promise<TreeData<ItemData>> {
    const rootItem = new TreeData<ItemData>(ItemService.rootItemData);
    const mapRequest = request.pipe(
      catchError(() => []),
      map((treeItems) =>
        // Récupère tous les arbres en tant qu'enfants de rootItem
        treeItems
          .map((treeItemObj) => convertToTreeData(treeItemObj, '0', giveIdCall))
          .reduce((accumulator, current) => {
            accumulator.addChild(current);
            return accumulator;
          }, rootItem),
      ),
    );
    return lastValueFrom(mapRequest);
  }
}

function convertToTreeData(
  json: TreeItemData,
  parentTreeItemId: string,
  giveIdCall: Function,
): TreeData<ItemData> {
  const treeData = new TreeData(
    new ItemData(json.id, json.title, json.text, json.state, json.status, json.CRUDMode),
  );
  const treeItemId = giveIdCall();
  treeData.setTreeItemId(treeItemId);
  treeData.setParentTreeItemId(parentTreeItemId);
  treeData.setChildren(
    json.children.map((treeItem: any) => convertToTreeData(treeItem, treeItemId, giveIdCall)),
  );
  return treeData;
}
