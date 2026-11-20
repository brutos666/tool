import { inject, Service, signal } from '@angular/core';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';
import { HttpClient, HttpContext, HttpClientCommonOptions } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
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
  private exportNotificationMessage = new NotificationMessage(
    'Export terminé',
    "Une erreur est survenue lors de l'export",
  );
  private importNotificationMessage = new NotificationMessage(
    'Import terminé',
    "Une erreur est survenue lors de l'import",
  );

  constructor() {
    this.loadItems();
  }

  public loadItems() {
    const request = this.http.get<TreeItemData[]>(
      '/api/item/findAllItems',
      this.getJsonOptions(this.loadNotificationMessage),
    );
    this.treeItemsResponse(request, 'replaceAll');
  }
  public loadCurrentItem() {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      this.loadItem(currentItem);
    }
  }

  public saveAllItems() {
    const rootItem = this.rootItemSubject.value;
    this.saveItem(rootItem);
  }
  public saveCurrentItem() {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      this.saveItem(currentItem);
    }
  }

  public exportAllItems() {
    const rootItem = this.rootItemSubject.value;
    const fileName = 'toutes_mes_taches.txt';
    this.exportItem(rootItem, fileName);
  }
  public exportCurrentItem() {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      const fileName = `${currentItem.getContent().getTitle().replaceAll(' ', '_')}.txt`;
      this.exportItem(currentItem, fileName);
    }
  }

  public importAllItems(file: File, replace: boolean) {
    this.importItems(file, replace ? 'replaceAll' : 'append');
  }
  public importCurrentItem(file: File) {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      this.importItems(file, 'replaceCurrent');
    }
  }

  private loadItem(treeItem: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    if (!treeItem.getParentTreeItemId().length) {
      this.loadItems();
      return;
    }
    const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
    if (treeItem?.getContent().isNew()) {
      if (parentItem) {
        this.loadItem(parentItem);
      }
      return;
    }
    const requestObservable = this.http.get<TreeItemData>(
      `/api/item/load?id=${treeItem.getItemId()}&parentId=${parentItem?.getItemId()}`,
      this.getJsonOptions(this.loadNotificationMessage),
    );
    this.treeDataResponse(treeItem, requestObservable);
  }
  private saveItem(treeItem: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
    if (parentItem?.getContent().isNew()) {
      this.saveItem(parentItem);
      return;
    }
    const treeInfosData = this.getTreeInfoData(parentItem, treeItem);
    const requestObservable = this.http.post<TreeInfoData>(
      '/api/item/save',
      treeInfosData,
      this.getJsonOptions(this.saveNotificationMessage),
    );
    this.treeInfosResponse(treeItem, requestObservable);
  }

  private exportItem(treeItem: TreeData<ItemData>, fileName: string) {
    const rootItem = this.rootItemSubject.value;
    const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
    const treeInfosData = this.getTreeInfoData(parentItem, treeItem);
    const requestObservable = this.http.post<Blob>(
      '/api/export/items',
      treeInfosData,
      this.getFileOptions(this.exportNotificationMessage),
    );
    this.fileResponse(requestObservable, fileName);
  }
  private importItems(file: File, action: 'replaceAll' | 'replaceCurrent' | 'append') {
    const formData = new FormData();
    formData.append('fileToUpload', file, file.name);

    const requestObservable = this.http.post<TreeItemData[]>(
      '/api/import/items',
      formData,
      this.getJsonOptions(this.importNotificationMessage),
    );
    this.treeItemsResponse(requestObservable, action);
  }

  private getJsonOptions(message: NotificationMessage) {
    return {
      context: new HttpContext().set(ErrorInterceptor.notificationMessage, message),
    };
  }
  private getFileOptions(message: NotificationMessage): {
    responseType: 'blob';
  } & HttpClientCommonOptions {
    return {
      context: new HttpContext().set(ErrorInterceptor.notificationMessage, message),
      responseType: 'blob',
    };
  }
  private treeInfosResponse(treeItem: TreeData<ItemData>, request: Observable<TreeInfoData>) {
    request
      .pipe(
        catchError(() => []),
        map((treeInfoObj) => {
          return this.convertTreeInfosData(treeInfoObj, treeItem.getParentTreeItemId());
        }),
      )
      .subscribe((newTreeItem) => {
        const rootItem = this.rootItemSubject.value;
        const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
        if (parentItem) {
          this.replaceItem(parentItem, treeItem, newTreeItem);
        } else {
          this.propageUpdates(newTreeItem);
        }
      });
  }

  private treeDataResponse(treeItem: TreeData<ItemData>, request: Observable<TreeItemData>) {
    request
      .pipe(
        catchError(() => []),
        map((treeItemObj) => this.convertToTreeData(treeItemObj, treeItem.getParentTreeItemId())),
      )
      .subscribe((loadTreeItem) => {
        const rootItem = this.rootItemSubject.value;
        const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
        if (parentItem) {
          this.replaceItem(parentItem, treeItem, loadTreeItem);
        }
      });
  }

  private treeItemsResponse(
    request: Observable<TreeItemData[]>,
    action: 'replaceAll' | 'replaceCurrent' | 'append',
  ) {
    const responseItem = new TreeData<ItemData>(ItemService.rootItemData);
    if (action === 'replaceAll') {
      this.treeItemId = 0;
    }
    request
      .pipe(
        catchError(() => []),
        map((treeItems) =>
          // Récupère tous les arbres en tant qu'enfants de responseItem
          treeItems
            .map((treeItemObj) => this.convertToTreeData(treeItemObj, '0'))
            .reduce((accumulator, current) => {
              accumulator.addChild(current);
              return accumulator;
            }, responseItem),
        ),
      )
      .subscribe((responseItem) => {
        if (!responseItem.getChildren().length) {
          return;
        }
        const rootItem = this.rootItemSubject.value;
        switch (action) {
          case 'append':
            rootItem.addChildren(responseItem.getChildren());
            this.rootItemSubject.next(rootItem.copy());
            break;
          case 'replaceAll':
            this.propageUpdates(responseItem);
            break;
          case 'replaceCurrent':
            const currentItem = this.currentItemSignal();
            if (currentItem) {
              const toReplace = responseItem.getChildren()[0];
              // Remplacement du courant
              const parentItem = rootItem.getTreeByTreeId(currentItem.getParentTreeItemId());
              this.replaceItem(parentItem, currentItem, toReplace);
            }
            break;
          default:
            break;
        }
      });
  }

  private fileResponse(request: Observable<Blob>, fileName: string) {
    request.pipe(catchError(() => [])).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }

  private replaceItem(
    parent: TreeData<ItemData> | null,
    toReplace: TreeData<ItemData>,
    replaceBy: TreeData<ItemData>,
  ) {
    if (!parent) {
      return;
    }
    const rootItem = this.rootItemSubject.value;
    if (replaceBy.getContent().isToRemove()) {
      parent.removeChild(toReplace);
    } else {
      parent.replaceChild(toReplace, replaceBy);
      if (this.currentItemSignal() === toReplace) {
        this.currentItemSignal.set(replaceBy);
      }
    }
    this.propageUpdates(rootItem);
  }

  private getTreeInfoData(
    parentItem: TreeData<ItemData> | null,
    treeItem: TreeData<ItemData>,
  ): TreeInfoData {
    const treeInfosData = new TreeInfoData();
    treeInfosData.item = this.convertToTreeItemData(treeItem);
    if (parentItem) {
      treeInfosData.parentItemId = parentItem.getItemId();
      treeInfosData.previousItemId = parentItem.getPrevious(treeItem)?.getItemId() || '';
      treeInfosData.nextItemId = parentItem.getNext(treeItem)?.getItemId() || '';
    }
    return treeInfosData;
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

  private convertTreeInfosData(json: TreeInfoData, parentTreeItemId: string): TreeData<ItemData> {
    return this.convertToTreeData(json.item, parentTreeItemId);
  }

  private convertToTreeData(json: TreeItemData, parentTreeItemId: string): TreeData<ItemData> {
    const treeData = new TreeData(
      new ItemData(json.id, json.title, json.text, json.state, json.status, json.CRUDMode),
    );
    this.treeItemId++;
    const treeItemId = `${this.treeItemId}`;
    treeData.setTreeItemId(treeItemId);
    treeData.setParentTreeItemId(parentTreeItemId);
    treeData.setChildren(
      json.children.map((treeItem: any) => this.convertToTreeData(treeItem, treeItemId)),
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
