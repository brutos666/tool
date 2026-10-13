import { inject, Service, signal } from '@angular/core';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';
import { HttpClient, HttpContext } from '@angular/common/http';
import { environment } from '../config/environment';
import { BehaviorSubject, catchError, map } from 'rxjs';
import { TreeItemData } from '../data/tree-item-data.js';
import { TreeInfoData } from '../data/tree-info-data.js';
import { ErrorInterceptor } from '../errors/error-interceptor.js';
import { NotificationMessage } from '../errors/notification-messages.js';

@Service()
export class ItemService {
  static rootItemData = new ItemData('-1', 'Racine', '', '', '', '');
  private http = inject(HttpClient);
  private rootItemSubject = new BehaviorSubject<TreeData<ItemData>>(
    new TreeData<ItemData>(ItemService.rootItemData),
  );
  // asObservable permet de retourner un observable du sujet. Ainsi, on peut souscrire et être notifié à chaque fois que le sujet est modifié avec next
  rootItem$ = this.rootItemSubject.asObservable();
  currentItemSignal = signal<TreeData<ItemData> | null>(null);

  // Identifiant unique indépendant de l'identifiant issu de la base de données. Permet d'identifiant les nouveaux éléments non sauvegardés
  private treeItemId: number = 0;

  private loadNotificationMessage = new NotificationMessage(
    'Chargement effectué',
    'Une erreur est survenue lors du chargement des éléments',
  );
  private saveNotificationMessage = new NotificationMessage(
    'Les modifications ont bien été enregistrées',
    'Une erreur est survenue lors de la sauvegarde des modifications',
  );

  constructor() {
    this.loadItems();
  }

  public loadItems() {
    this.treeItemId = 0;
    const rootItem = new TreeData<ItemData>(ItemService.rootItemData);
    this.http
      .get<TreeItemData[]>(`${environment.apiUrl}/item/findAllItems`, {
        context: new HttpContext().set(
          ErrorInterceptor.notificationMessage,
          this.loadNotificationMessage,
        ),
      })
      .pipe(
        catchError(() => []),
        map((treeItems) =>
          treeItems
            .map((treeItemObj) => {
              return this.convertToTreeData(treeItemObj, '0');
            })
            .reduce((accumulator, current) => {
              accumulator.addChild(current);
              return accumulator;
            }, rootItem),
        ),
      )
      .subscribe((rootItem) => {
        // next met à jour le sujet avec la valeur
        this.propageUpdates(rootItem);
      });
  }

  public saveAllItems() {
    const rootItem = this.rootItemSubject.value;
    this.saveItem(rootItem);
  }

  public saveCurrentItem() {
    const currentItem = this.currentItemSignal();
    if (!currentItem) {
      return;
    }
    this.saveItem(currentItem);
  }

  private saveItem(treeItem: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
    if (parentItem?.getContent().isNew()) {
      this.saveItem(parentItem);
      return;
    }
    const treeInfosData = new TreeInfoData();
    treeInfosData.item = this.convertToTreeItemData(treeItem);
    if (parentItem) {
      treeInfosData.parentItemId = parentItem.getItemId();
      treeInfosData.previousItemId = parentItem.getPrevious(treeItem)?.getItemId() || '';
      treeInfosData.nextItemId = parentItem.getNext(treeItem)?.getItemId() || '';
    }
    this.http
      .post(`${environment.apiUrl}/item/save`, treeInfosData, {
        context: new HttpContext().set(
          ErrorInterceptor.notificationMessage,
          this.saveNotificationMessage,
        ),
      })
      .pipe(
        catchError(() => {
          return [];
        }),
        map((treeInfoObj) => {
          const resultTreeInfo = Object.assign(new TreeInfoData(), treeInfoObj);
          return this.convertToTreeData(resultTreeInfo.item, parentItem?.getTreeItemId() || '0');
        }),
      )
      .subscribe((newTreeItem) => {
        if (parentItem) {
          this.replaceItem(parentItem, treeItem, newTreeItem);
        } else {
          this.propageUpdates(newTreeItem);
        }
      });
  }

  private replaceItem(
    parent: TreeData<ItemData>,
    toReplace: TreeData<ItemData>,
    replaceBy: TreeData<ItemData>,
  ) {
    const rootItem = this.rootItemSubject.value;
    if (replaceBy.getContent().isToRemove()) {
      parent.removeChild(toReplace);
    } else {
      parent.replaceChild(toReplace, replaceBy);
    }
    this.propageUpdates(rootItem);
  }

  public updateItem(treeData: TreeData<ItemData>, property: string, value: string) {
    const rootItem = this.rootItemSubject.value;
    const callback = (tree: TreeData<ItemData>) =>
      tree.getContent().setValueProperty(property, value);
    if (this.applyNodes(rootItem, treeData, callback)) {
      this.propageUpdates(rootItem);
    }
  }

  public addRootItem(title: string) {
    const treeRootItem = this.rootItemSubject.value;
    const treeData = this.createNewItem(treeRootItem.getTreeItemId(), title);
    treeRootItem.addChild(treeData);
    this.propageUpdates(treeRootItem);
  }

  public addChildItem(treeData: TreeData<ItemData>, title: string) {
    const rootItem = this.rootItemSubject.value;
    const callback = (tree: TreeData<ItemData>) => {
      const treeData = this.createNewItem(tree.getTreeItemId(), title);
      tree.addChild(treeData);
    };
    if (this.applyNodes(rootItem, treeData, callback)) {
      this.propageUpdates(rootItem);
    }
  }

  public markToDelete(treeData: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const callback = treeData.getContent().isNew()
      ? (tree: TreeData<ItemData>, parentTree: TreeData<ItemData>) => parentTree.removeChild(tree)
      : (tree: TreeData<ItemData>) =>
          this.applyTree(tree, (node: TreeData<ItemData>) => node.getContent().markToDelete());
    if (this.applyNodes(rootItem, treeData, callback)) {
      this.propageUpdates(rootItem);
    }
  }
  public undoToDelete(treeData: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const callback = (tree: TreeData<ItemData>) =>
      this.applyTree(tree, (node: TreeData<ItemData>) => node.getContent().undoToDelete());
    if (this.applyNodes(rootItem, treeData, callback)) {
      this.propageUpdates(rootItem);
    }
  }

  public setCurrentItem(treeData: TreeData<ItemData>) {
    this.currentItemSignal.set(treeData);
  }
  public isCurrentItem(treeData: TreeData<ItemData>) {
    return this.currentItemSignal() === treeData;
  }

  private propageUpdates(rootItem: TreeData<ItemData>) {
    // Mise à jour pour les souscripteurs
    this.rootItemSubject.next(rootItem.copy());
    // Le courant doit être mis à jour
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      const foundItem = currentItem.getContent().isNew()
        ? rootItem.getTreeByTreeId(currentItem.getTreeItemId())
        : rootItem.getTreeByItemId(currentItem.getItemId());
      this.currentItemSignal.set(foundItem);
    }
  }

  private createNewItem(parentId: string, title: string) {
    this.treeItemId++;
    const treeData = new TreeData(new ItemData('', title, '', 'TODO', '', ''));
    treeData.getContent().markAsNew();
    treeData.setTreeItemId(`${this.treeItemId}`);
    treeData.setParentTreeItemId(parentId);
    return treeData;
  }

  private applyNodes(
    parentTree: TreeData<ItemData>,
    treeData: TreeData<ItemData>,
    callback: Function,
  ): boolean {
    const nodes = parentTree.getChildren();
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].getTreeItemId() === treeData.getTreeItemId()) {
        nodes[i] = nodes[i].copy();
        callback(nodes[i], parentTree);
        return true;
      }
      if (this.applyNodes(nodes[i], treeData, callback)) {
        nodes[i] = nodes[i].copy();
        return true;
      }
    }
    return false;
  }

  private applyTree(node: TreeData<ItemData>, callback: Function) {
    callback(node);
    const nodes = node.getChildren();
    for (let i = 0; i < nodes.length; i++) {
      nodes[i] = nodes[i].copy();
      this.applyTree(nodes[i], callback);
    }
  }

  private convertToTreeData(treeItemObj: Object, parentTreeItemId: string): TreeData<ItemData> {
    const treeItemData = Object.assign(new TreeItemData(), treeItemObj);
    const treeData = treeItemData.convertToTreeData();
    this.treeItemId++;
    const treeItemId = `${this.treeItemId}`;
    treeData.setTreeItemId(treeItemId);
    treeData.setParentTreeItemId(parentTreeItemId);
    treeData.setChildren(
      treeItemData.children.map((treeItem) => this.convertToTreeData(treeItem, treeItemId)),
    );
    return treeData;
  }

  private convertToTreeItemData(treeData: TreeData<ItemData>): TreeItemData {
    const itemData = treeData.getContent();
    const treeItemData = new TreeItemData();
    treeItemData.id = itemData.getId();
    treeItemData.title = itemData.getTitle();
    treeItemData.text = itemData.getText();
    treeItemData.state = itemData.getState();
    treeItemData.status = itemData.getStatus();
    treeItemData.CRUDMode = itemData.getCRUDMode();
    treeItemData.children = treeData
      .getChildren()
      .map((child) => this.convertToTreeItemData(child));
    return treeItemData;
  }
}
