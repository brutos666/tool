import { ITEM_LAYOUT, RIGHT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Item from './Item.js';
import TreeFocusManager from './TreeFocusManager.js';
import TreeItems from './TreeItems.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import TreeElement from './decorators/TreeElement.js';
import CheckListView from './views/CheckListView.js';

class CheckList extends TreeItems {

  name = 'CheckList';

  #decoratedTitleItem;

  constructor(treeItem) {
    super(new CheckListView(), treeItem, ITEM_LAYOUT.Todo);

    const rights = [RIGHT.update];
    this.#decoratedTitleItem = new DragDropDecorator(new Item({ treeItem, layout: ITEM_LAYOUT.Todo, rights }));
    this.setStaticChild('title', this.#decoratedTitleItem);

    const addButton = new AddItemButton({ id: 'addNewItem', label: 'Ajouter un élément', layout: ITEM_LAYOUT.Todo });
    addButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un pense-bête'));
    this.setStaticChild('addItemAction', addButton);
  }

  /** @override */
  initFocusManager() {
    super.setFocusManager(new TreeFocusManager(this.getElementView(), 'horizontal', false));
  }

  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#decoratedTitleItem.setTreeItem(treeItem);
    super.setTreeItem(treeItem);
  }

  /** @override */
  getItemComponent(treeItem) {
    const itemComponent = super.getItemComponent(treeItem);
    const treeComponent = itemComponent.getDecoratedElementByName('Tree');
    treeComponent.setRoot();
    treeComponent.setOpen(true);
    // Ajout d'un décorateur permettant de mettre du style sur chaque arbre
    return new TreeElement(itemComponent);
  }

  /** @override */
  added(parent) {
    super.added(parent);

    this.getStaticChild('title')
      .getDecoratedElementByName('Item')
      .setTabIndex(0);

    super.getFocusManager()
      .enableKeyNavigation();
  }

}

export default CheckList;