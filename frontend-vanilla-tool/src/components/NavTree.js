import StoreData from '../data/StoreData.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Component from './Component.js';
import TreeList from './TreeList.js';
import NavTreeView from './views/NavTreeView.js';
/** @import TreeFocusManager from './TreeFocusManager.js'; */
/** @import Tree from './decorators/Tree.js'; */

class NavTree extends Component {

  name = 'NavTree';

  #currentTree = null;

  constructor() {
    super(new NavTreeView());

    const items = new TreeList(true, StoreData.getTreeItem(), ITEM_LAYOUT.Title);
    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un espace', layout: ITEM_LAYOUT.Title });
    addButton.setDoActionCallback(items.addNewItem.bind(items, 'Saisir un espace'));
    items.setStaticChild('addItemAction', addButton);
    this.setStaticChild('treeItems', items);

    /** @type {TreeFocusManager} */
    const treeFocusManager = items.getFocusManager();
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
  /**
   * Lorsque l'utilisateur entre dans le composant avec la touche Entrée ou la souris
   * @param {Component} component
   * @returns true l'entrée dans le composant doit se faire, false si elle ne doit pas se faire
   */
  onEnterIn(component) {
    if (component.getName() !== 'Tree' || component.isCurrent()) {
      return true;
    }
    this.setCurrentTree(component);
    return false;
  }

}

export default NavTree;