import Tree from './decorators/Tree.js';
import Item from './Item.js';
import TreeListView from './views/TreeListView.js';
import { RIGHT, ITEM_LAYOUT } from '../tools/Constants.js';
import CommandItemDecorator from './decorators/CommandItemDecorator.js';
import Items from './Items.js';
/** @import TreeItem from '../data/TreeItem.js'; */
/** @import TreeItemList from '../data/TreeItemList.js'; */

class TreeList extends Items {

  name = 'TreeList';

  /**
   *
   * @param {TreeItemList} treeItemList
   * @param {ITEM_LAYOUT} itemLayout
   */
  constructor(treeItemList, itemLayout) {
    super(new TreeListView(), treeItemList, itemLayout);
  }

  setTreeItemList(treeItemList) {
    super.setTreeItemList(treeItemList);
    for (const tree of this.getChildren()) {
      tree.setRoot();
      tree.setOpen(true);
    }
  }

  /**
   * @override
   * @param {TreeItem} treeItem - Item à ajouter
   */
  addItem(treeItem) {
    const itemRights = this.getLayout() === ITEM_LAYOUT.Title ? [] : [ RIGHT.create, RIGHT.update, RIGHT.delete ];
    const rights = treeItem.isRoot() ? [ RIGHT.update, RIGHT.delete ] : itemRights;
    const readOnly = !rights.includes(RIGHT.update);
    const item = new Item({ treeItem, layout: this.getLayout(), rights });
    if (readOnly) {
      super.addChild(new Tree(item, { treeItem, layout: this.getLayout(), rights }));
      return;
    }
    // Mise en place du décorateur permettant la validation en base de données
    const commandItem = new CommandItemDecorator(item, { treeItem, rights });
    const treeElement = new Tree(commandItem, { treeItem, layout: this.getLayout(), rights });
    super.addChild(treeElement);
  }

}

export default TreeList;