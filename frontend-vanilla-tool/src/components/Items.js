import Item from './Item.js';
import TreeList from './TreeList.js';

class Items extends TreeList {

  name = 'Items';

  #itemLayout;

  constructor(itemLayout) {
    super();

    this.#itemLayout = itemLayout;
  }

  getLayout() {
    return this.#itemLayout;
  }

  addNewItem() {
    this.addChild(new Item({ itemInfos: {}, viewChoice: this.getLayout() }));
  }

  addItem(itemInfos) {
    this.addChild(new Item({ itemInfos, viewChoice: this.getLayout() }));
  }
  /**
   * Ajout des items
   * @param {Array<ItemInfos>} itemInfosList
   */
  addItems(itemInfosList) {
    this.removeAllChildren();
    if (itemInfosList.length === 0) {
      this.addNewItem();
      return;
    }
    const allItemsCards = itemInfosList.map(itemInfos => new Item({ itemInfos, viewChoice: this.getLayout() }));
    this.setChildren(allItemsCards);
  }

}

export default Items;