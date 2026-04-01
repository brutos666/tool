import { VIEW_CHOICE } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Toolbar from './Toolbar.js';
import ItemContainer from './ItemContainer.js';
import ItemsLayout from './ItemsLayout.js';
/** @import Item from './Item.js' */

class BasicLayout extends ItemsLayout {

  #itemContainer;

  constructor() {
    super(VIEW_CHOICE.SampleMapping);
    const addItemAction = new ActionButton({ id: 'add-item-action', label: 'Ajouter une tâche' });
    addItemAction.setDoActionCallback(this.addNewItem.bind(this));
    const toolbar = new Toolbar();
    toolbar.addChild(addItemAction);

    /** @type {ItemContainer} */
    this.#itemContainer = new ItemContainer({ viewChoice: VIEW_CHOICE.TodoList });
    this.addChild(toolbar);
    this.addChild(this.#itemContainer);
  }

  /**
   * @override
   * @param {Item} item - Item
   */
  addItem(item) {
    this.#itemContainer.addChild(item);
  }
  /**
   * @override
   * @param {Array<Item>} items - Liste d'items
   */
  setItems(items) {
    this.#itemContainer.setChildren(items);
  }
  /**
   * En fonction des informations sur la carte, la carte pourra être affiché dans des espaces dédiés ou avec une vue spécifique en fonction de la vue choisie. Cette méthode est donc à surcharger
   */
  removeAllItems() {
    this.#itemContainer.removeAllChildren();
  }

}

export default BasicLayout;