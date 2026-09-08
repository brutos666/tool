import { Service } from '@angular/core';
import { TreeData } from '../data/tree-data.js';
import { ItemData } from '../data/item-data.js';

@Service()
export class ItemService {
  constructor() {
    this.load();
  }

  private load() {
    const treeItems: Array<TreeData<ItemData>> = this.getAll();
    this.save(treeItems);
  }

  private save(treeItems: Array<TreeData<ItemData>>) {
    const rootItem = new TreeData(this.createItem('-1', 'Racine'));
    rootItem.setChildren(treeItems);
    localStorage.setItem('rootItem', JSON.stringify(rootItem));
  }

  getAll() {
    const treeItems: Array<TreeData<ItemData>> = [];

    const treeItem = new TreeData(this.createItem('1', 'Parent 1'));
    treeItem.addChild(new TreeData(this.createItem('1-1', 'Enfant 1')));
    treeItem.addChild(new TreeData(this.createItem('1-2', 'Enfant 2')));
    treeItems.push(treeItem);
    const treeItem2 = new TreeData(this.createItem('2', 'Parent 2'));
    const treeItem2_1 = new TreeData(this.createItem('2-1', 'Enfant 1 de 2'));
    treeItem2.addChild(treeItem2_1);
    treeItem2.addChild(new TreeData(this.createItem('2-2', 'Enfant 2 de 2')));
    const treeItem2_1_1 = new TreeData(this.createItem('2-1-1', 'Enfant 1 de 2-1'));
    treeItem2_1.addChild(treeItem2_1_1);
    treeItems.push(treeItem2);

    return treeItems;
  }

  createItem(id: string, title: string): ItemData {
    return new ItemData(id, title, '', 'TODO', 'OK');
  }
}
