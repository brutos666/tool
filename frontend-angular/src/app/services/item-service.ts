import { inject, Service } from '@angular/core';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/environment';
import { BehaviorSubject, catchError, map } from 'rxjs';
import { TreeItemData } from '../data/tree-item-data.js';

@Service()
export class ItemService {
  static rootItemData = new ItemData('-1', 'Racine', '', '', '', '');
  private http = inject(HttpClient);
  private rootItemSubject = new BehaviorSubject<TreeData<ItemData>>(
    new TreeData<ItemData>(ItemService.rootItemData),
  );
  // asObservable permet de retourner un observable du sujet. Ainsi, on peut souscrire et être notifié à chaque fois que le sujet est modifié avec next
  rootItem$ = this.rootItemSubject.asObservable();

  // Identifiant unique indépendant de l'identifiant issu de la base de données. Permet d'identifiant les nouveaux éléments non sauvegardés
  private treeItemId: number = 0;

  constructor() {
    this.loadItems();
  }

  public loadItems() {
    this.treeItemId = 0;
    const rootItem = new TreeData<ItemData>(ItemService.rootItemData);
    this.http
      .get<TreeItemData[]>(`${environment.apiUrl}/item/findAllItems`)
      .pipe(
        catchError(() => {
          this.rootItemSubject.error('An error occurred');
          return [];
        }),
        map((treeItems) =>
          treeItems
            .map((treeItemObj) => {
              return this.convertToTreeData(treeItemObj, '-1');
            })
            .reduce((accumulator, current) => {
              accumulator.addChild(current);
              return accumulator;
            }, rootItem),
        ),
      )
      .subscribe((rootItem) => {
        // next met à jour le sujet avec la valeur
        this.rootItemSubject.next(rootItem);
      });
  }

  public updateItem(treeData: TreeData<ItemData>, property: string, value: string) {
    const rootItem = this.rootItemSubject.value;
    const callback = (tree: TreeData<ItemData>) =>
      tree.getContent().setValueProperty(property, value);
    if (this.applyNodes(rootItem, treeData, callback)) {
      // Mise à jour pour les souscripteurs
      this.rootItemSubject.next(rootItem.copy());
    }
  }

  addRootItem(title: string) {
    const treeRootItem = this.rootItemSubject.value;
    const treeData = this.createNewItem(treeRootItem.getTreeItemId(), title);
    treeRootItem.addChild(treeData);
    // Mise à jour pour les souscripteurs
    this.rootItemSubject.next(treeRootItem.copy());
  }

  addChildItem(treeData: TreeData<ItemData>, title: string) {
    const rootItem = this.rootItemSubject.value;
    const callback = (tree: TreeData<ItemData>) => {
      const treeData = this.createNewItem(tree.getTreeItemId(), title);
      tree.addChild(treeData);
    };
    if (this.applyNodes(rootItem, treeData, callback)) {
      // Mise à jour pour les souscripteurs
      this.rootItemSubject.next(rootItem.copy());
    }
  }

  markToDelete(treeData: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const callback = treeData.getContent().isNew()
      ? (tree: TreeData<ItemData>, parentTree: TreeData<ItemData>) => parentTree.removeChild(tree)
      : (tree: TreeData<ItemData>) =>
          this.applyTree(tree, (node: TreeData<ItemData>) => node.getContent().markToDelete());
    if (this.applyNodes(rootItem, treeData, callback)) {
      // Mise à jour pour les souscripteurs
      this.rootItemSubject.next(rootItem.copy());
    }
  }
  undoToDelete(treeData: TreeData<ItemData>) {
    const rootItem = this.rootItemSubject.value;
    const callback = (tree: TreeData<ItemData>) =>
      this.applyTree(tree, (node: TreeData<ItemData>) => node.getContent().undoToDelete());
    if (this.applyNodes(rootItem, treeData, callback)) {
      // Mise à jour pour les souscripteurs
      this.rootItemSubject.next(rootItem.copy());
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

  private convertToTreeData(treeItemObj: Object, parentId: string): TreeData<ItemData> {
    const treeItemData = Object.assign(new TreeItemData(), treeItemObj);
    const treeData = treeItemData.convertToTreeData();
    this.treeItemId++;
    const treeItemId = `${this.treeItemId}`;
    treeData.setTreeItemId(treeItemId);
    treeData.setParentTreeItemId(parentId);
    treeData.setChildren(
      treeItemData.children.map((treeItem) => this.convertToTreeData(treeItem, treeItemId)),
    );
    return treeData;
  }
}
