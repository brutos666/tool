import Composite from './Composite.js';
import Item from './Item.js';
import { VIEW_CHOICE } from '../tools/Constants.js';
import LoadItems from '../commands/LoadItems.js';
/** @import { ItemInfos } from './Item.js' */

class ItemsLayout extends Composite {

  #layout = VIEW_CHOICE.Detail;

  constructor(layout, view) {
    super(view);
    this.#layout = layout;
  }

  setLayout(layout) {
    this.#layout = layout;
  }

  getLayout() {
    return this.#layout;
  }

  /**
   * @override
   */
  commandDone(name, itemInfosList) {
    super.commandDone(name, itemInfosList);

    if (name !== 'LoadItems') {
      return;
    }
    this.removeAllItems();
    if (itemInfosList.length === 0) {
      this.addNewItem();
      return;
    }
    const allItemsCards = itemInfosList.map(itemInfos => new Item({ itemInfos, viewChoice: this.getLayout() }));
    this.setItems(allItemsCards);
  }

  loadItems() {
    new LoadItems(this)
      .execute();
  }

  addNewItem() {
    this.addItem(new Item({ itemInfos: {}, viewChoice: this.getLayout() }));
  }

  /**
   * En fonction des informations sur l'item, l'item pourra être affiché dans des espaces dédiés ou avec une vue spécifique en fonction de la vue choisie. Cette méthode est donc à surcharger
   * @param {Item} item - item
   */
  addItem(item) {
    this.addChild(item);
  }
  /**
   * En fonction des informations sur l'item, l'item pourra être affiché dans des espaces dédiés ou avec une vue spécifique en fonction de la vue choisie. Cette méthode est donc à surcharger
   * @param {Array<Item>} items - Liste des items de taches
   */
  setItems(items) {
    this.setChildren(items);
  }
  /**
   * En fonction des informations sur l'item, l'item pourra être affiché dans des espaces dédiés ou avec une vue spécifique en fonction de la vue choisie. Cette méthode est donc à surcharger
   */
  removeAllItems() {
    this.removeAllChildren();
  }

}

export default ItemsLayout;