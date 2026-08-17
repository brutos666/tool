import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import TreeItems from './TreeItems.js';
import NavTreeView from './views/NavTreeView.js';
/** @import TreeFocusManager from './TreeFocusManager.js'; */
/** @import Tree from './decorators/Tree.js'; */

class NavTree extends TreeItems {

  name = 'NavTree';

  /** @type {Tree} */
  #currentTree = null;

  constructor() {
    super(new NavTreeView(), StoreData.getTreeItem(), ITEM_LAYOUT.Title);

    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un élément', layout: ITEM_LAYOUT.Title });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un espace'));
    this.setStaticChild('addItemAction', addButton);

    /** @type {TreeFocusManager} */
    const treeFocusManager = this.getFocusManager();
    treeFocusManager.setCallbackBeforeEnter(this.onEnterIn.bind(this));
  }

  getCurrentTree() {
    return this.#currentTree;
  }
  setCurrentTree(currentTree) {
    this.#currentTree?.removeCurrent();
    this.#currentTree = currentTree;
    currentTree.setCurrent();
  }

  /** @override */
  removeChild(element) {
    super.removeChild(element);

    if (this.#currentTree === element) {
      this.#currentTree.removeCurrent();
      this.#currentTree = null;
    }
  }

  /** @override */
  removeAllChildren() {
    super.removeAllChildren();

    this.#currentTree?.removeCurrent();
    this.#currentTree = null;
  }
  /** @override */
  replaceAllItems(treeItemArray) {
    const currentItemId = this.#currentTree?.getDecoratedElementByName('Item')
      .getTreeItem()
      .getItemId();

    super.replaceAllItems(treeItemArray);

    if (currentItemId) {
      const currentTree = this.findTreeByItemId(currentItemId);
      if (currentTree) {
        this.setCurrentTree(currentTree);
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
    if (component.getName() !== 'Tree' || component === this.#currentTree) {
      return true;
    }
    this.setCurrentTree(component);
    return false;
  }

}

export default NavTree;