import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import TreeItems from './TreeItems.js';
import NavTreeView from './views/NavTreeView.js';
/** @import TreeFocusManager from './TreeFocusManager.js'; */
/** @import Tree from './decorators/Tree.js'; */

class NavTree extends TreeItems {

  name = 'NavTree';

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
  removeChild(child) {
    if (this.#currentTree === child) {
      this.#currentTree.removeCurrent();
      this.#currentTree = null;
    }
  }
  removeAllChildren() {
    this.#currentTree?.removeCurrent();
    this.#currentTree = null;
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