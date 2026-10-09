import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import TreeElement from './decorators/TreeElement.js';
import TreeItems from './TreeItems.js';
import NavTreeView from './views/NavTreeView.js';
/** @import TreeFocusManager from './TreeFocusManager.js'; */
/** @import Tree from './decorators/Tree.js'; */

class NavTree extends TreeItems {

  name = 'NavTree';

  constructor() {
    super(new NavTreeView(), StoreData.getTreeItem(), ITEM_LAYOUT.Title);

    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un élément', layout: ITEM_LAYOUT.Title });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un espace'));
    this.setStaticChild('addItemAction', addButton);

    /** @type {TreeFocusManager} */
    const treeFocusManager = this.getFocusManager();
    treeFocusManager.setCallbackBeforeEnter(this.onEnterIn.bind(this));
  }

  /** @override */
  getItemComponent(treeItem) {
    const itemComponent = super.getItemComponent(treeItem);
    // Ajout d'un décorateur permettant de mettre du style sur chaque arbre
    return new TreeElement(itemComponent);
  }

  /** @override */
  replaceAllItems(treeItemArray) {
    const currentItemId = StoreData.getCurrentTree()
      ?.getDecoratedElementByName('Item')
      .getTreeItem()
      .getItemId();

    super.replaceAllItems(treeItemArray);

    if (currentItemId) {
      const currentTree = this.findTreeByItemId(currentItemId);
      if (currentTree) {
        StoreData.setCurrentTree(currentTree);
      }
    }
  }
  /**
   * Recherche l'arbre par rapport à son numéro d'identifiant
   * @param {number} itemId - Numéro d'identifiant
   * @returns {Tree} arbre
   */
  findTreeByItemId(itemId) {
    const child = this.getChildren()
      .find(child => {
        const item = child.getDecoratedElementByName('Item');
        return item.getTreeItem()
          .getItemId() === itemId;
      });
    if (child) {
      return child.getDecoratedElementByName('Tree');
    }
  }

  /**
   * Lorsque l'utilisateur entre dans le composant avec la touche Entrée ou la souris
   * @param {Component} component
   * @returns true l'entrée dans le composant doit se faire, false si elle ne doit pas se faire
   */
  onEnterIn(component) {
    if (component.getName() !== 'Tree' || component === StoreData.getCurrentTree()) {
      return true;
    }
    StoreData.setCurrentTree(component);
    return false;
  }

}

export default NavTree;