import { inject, Service, signal } from '@angular/core';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { TreeItemData } from '../data/tree-item-data.js';
import { TreeInfoData } from '../data/tree-info-data.js';
import { NotificationMessage } from '../errors/notification-messages.js';
import { RequestService } from './request-service.js';

type LoadAction = 'replaceAll' | 'replaceCurrent' | 'append';

@Service()
export class ItemService {
  private requestService = inject(RequestService);

  static rootItemData = new ItemData('-1', 'Travail à faire', '', '', '', '');
  private http = inject(HttpClient);
  private rootItemSubject = new BehaviorSubject<TreeData<ItemData>>(
    new TreeData<ItemData>(ItemService.rootItemData),
  );
  // asObservable permet de retourner un observable du sujet. Ainsi, on peut souscrire et être notifié à chaque fois que le sujet est modifié avec next
  rootItem$ = this.rootItemSubject.asObservable();
  currentItemSignal = signal<TreeData<ItemData> | null>(null);

  // Identifiant unique indépendant de l'identifiant issu de la base de données. Permet d'identifiant les nouveaux éléments non sauvegardés
  private treeItemId: number = 0;
  private uniqueId: number = 0;

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
  private openNotificationMessage = new NotificationMessage(
    'Ouverture terminée',
    "Une erreur est survenue lors de l'ouverture du fichier",
  );

  #giveIdCall = this.giveTreeItemId.bind(this);

  constructor() {
    this.loadItems();
  }

  public giveUniqueId() {
    return this.uniqueId++;
  }
  public giveTreeItemId() {
    return `${this.treeItemId++}`;
  }

  public async loadItems() {
    const request = this.http.get<TreeItemData[]>(
      '/api/item/findAllItems',
      this.requestService.getJsonOptions(this.loadNotificationMessage),
    );
    this.treeItemId = 0;
    const treeItem = await this.requestService.convertTreesToTreeItem(request, this.#giveIdCall);
    this.majModel('replaceAll', treeItem);
  }
  public loadCurrentItem() {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      this.loadItem(currentItem);
    }
  }

  public saveAllItems() {
    const rootItem = this.rootItemSubject.value;
    return this.saveItem(rootItem);
  }
  public saveCurrentItem() {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      this.saveItem(currentItem);
    }
  }

  public exportItem(item: TreeData<ItemData>, fileName: string) {
    return this.export(item, fileName);
  }

  public openFile(file: File) {
    return this.openItems(file);
  }

  public importAllItems(file: File) {
    this.importItems(file, 'append');
  }
  public importCurrentItem(file: File) {
    const currentItem = this.currentItemSignal();
    if (currentItem) {
      this.importItems(file, 'replaceCurrent');
    }
  }

  public proposeFileName(currentItem: TreeData<ItemData>): string {
    const title = new DOMParser()
      .parseFromString(currentItem.getContent().getTitle(), 'text/html')
      .body.textContent.replaceAll(' ', '_');
    return `${title}.txt`;
  }

  private async loadItem(treeItem: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const parentTreeItemId = treeItem.getParentTreeItemId();
    if (!parentTreeItemId.length) {
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
      this.requestService.getJsonOptions(this.loadNotificationMessage),
    );
    const loadTreeItem = await this.requestService.convertToTreeItem(
      parentTreeItemId,
      requestObservable,
      this.#giveIdCall,
    );
    this.replaceTreeItem(treeItem, loadTreeItem);
  }

  private async saveItem(treeItem: TreeData<ItemData>) {
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
      this.requestService.getJsonOptions(this.saveNotificationMessage),
    );
    const loadTreeItem = await this.requestService.convertTreeInfosDataToTreeItem(
      treeItem.getParentTreeItemId(),
      requestObservable,
      this.#giveIdCall,
    );
    this.replaceTreeItem(treeItem, loadTreeItem);
  }

  private export(treeItem: TreeData<ItemData>, fileName: string) {
    const rootItem = this.rootItemSubject.value;
    const parentItem = rootItem.getTreeByTreeId(treeItem.getParentTreeItemId());
    const treeInfosData = this.getTreeInfoData(parentItem, treeItem);
    const requestObservable = this.http.post<Blob>(
      `/api/export/items?file=${fileName}`,
      treeInfosData,
      this.requestService.getFileOptions(this.exportNotificationMessage),
    );
    return this.requestService.get<Blob>(requestObservable);
  }

  private async importItems(file: File, action: LoadAction) {
    const formData = new FormData();
    formData.append('fileToUpload', file, file.name);

    const requestObservable = this.http.post<TreeItemData[]>(
      '/api/import/items',
      formData,
      this.requestService.getJsonOptions(this.importNotificationMessage),
    );
    const treeItem = await this.requestService.convertTreesToTreeItem(
      requestObservable,
      this.#giveIdCall,
    );
    this.majModel(action, treeItem);
  }
  private async openItems(file: File) {
    const formData = new FormData();
    formData.append('fileToUpload', file, file.name);

    const requestObservable = this.http.post<TreeItemData[]>(
      '/api/item/open',
      formData,
      this.requestService.getJsonOptions(this.openNotificationMessage),
    );
    this.treeItemId = 0;
    const treeItem = await this.requestService.convertTreesToTreeItem(
      requestObservable,
      this.#giveIdCall,
    );
    this.majModel('replaceAll', treeItem);
  }

  private majModel(action: string, treeItem: TreeData<ItemData>) {
    if (!treeItem.getChildren().length) {
      return;
    }
    switch (action) {
      case 'append':
        const rootItem = this.rootItemSubject.value;
        rootItem.addChildren(treeItem.getChildren());
        this.rootItemSubject.next(rootItem.copy());
        break;
      case 'replaceAll':
        this.propageUpdates(treeItem);
        break;
      case 'replaceCurrent':
        const currentItem = this.currentItemSignal();
        if (currentItem) {
          const toReplace = treeItem.getChildren()[0];
          this.replaceTreeItem(currentItem, toReplace);
        }
        break;
      default:
        break;
    }
  }

  private replaceTreeItem(oldTreeItem: TreeData<ItemData>, loadTreeItem: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const parentItem = rootItem.getTreeByTreeId(oldTreeItem.getParentTreeItemId());
    if (parentItem) {
      this.replaceItem(parentItem, oldTreeItem, loadTreeItem);
    } else {
      this.propageUpdates(loadTreeItem);
    }
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
    treeInfosData.item = convertToTreeItemData(treeItem);
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

  public addAfterItem(treeData: TreeData<ItemData>, title: string) {
    const rootItem = this.rootItemSubject.value;
    let parentItem = rootItem.getTreeByTreeId(treeData.getParentTreeItemId());
    if (!parentItem) {
      parentItem = rootItem;
    }
    const callback = (tree: TreeData<ItemData>) => {
      const newTreeItem = this.createNewItem(tree.getTreeItemId(), title);
      tree.addAfterChild(treeData, newTreeItem);
    };
    if (this.applyNodes(rootItem, parentItem, callback)) {
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
    if (parentTree.getTreeItemId() === treeData.getTreeItemId()) {
      callback(treeData, parentTree);
      return true;
    }
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
}
function convertToTreeItemData(treeData: TreeData<ItemData>): TreeItemData {
  const itemData = treeData.getContent();
  const treeItemData = new TreeItemData();
  treeItemData.id = itemData.getId();
  treeItemData.title = itemData.getTitle();
  treeItemData.text = itemData.getText();
  treeItemData.state = itemData.getState();
  treeItemData.status = itemData.getStatus();
  treeItemData.CRUDMode = itemData.getCRUDMode();
  treeItemData.children = treeData.getChildren().map((child) => convertToTreeItemData(child));
  return treeItemData;
}
