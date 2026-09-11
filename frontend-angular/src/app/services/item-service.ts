import { inject, Service } from '@angular/core';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/environment';
import { BehaviorSubject, catchError, map } from 'rxjs';
import { TreeItemData } from '../data/tree-item-data.js';

@Service()
export class ItemService {
  private http = inject(HttpClient);
  private treeItemsSubject = new BehaviorSubject<TreeData<ItemData>[]>([]);
  // asObservable permet de retourner un observable du sujet. Ainsi, on peut souscrire et être notifié à chaque fois que le sujet est modifié avec next
  treeItems$ = this.treeItemsSubject.asObservable();

  // Identifiant unique indépendant de l'identifiant issu de la base de données. Permet d'identifiant les nouveaux éléments non sauvegardés
  private treeItemId: number = 0;

  constructor() {
    this.loadItems();
  }

  public loadItems() {
    this.treeItemId = 0;
    this.http
      .get<TreeItemData[]>(`${environment.apiUrl}/item/findAllItems`)
      .pipe(
        catchError(() => {
          this.treeItemsSubject.error('An error occurred');
          return [];
        }),
        map((treeItems) =>
          treeItems.map((treeItemObj) => {
            return this.convertToTreeData(treeItemObj, '-1');
          }),
        ),
      )
      .subscribe((treeItems) => {
        // next met à jour le sujet avec la valeur
        this.treeItemsSubject.next(treeItems);
      });
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
