import Item from './Item.js';
import TreeList from './TreeList.js';

class Items extends TreeList {

  name = 'Items';

  #itemLayout;

  constructor(itemLayout) {
    super();

    this.#itemLayout = itemLayout;
    this.setIsLeafCallback(item => item.isLeaf());
  }

  getLayout() {
    return this.#itemLayout;
  }

  addNewItem() {
    this.addChild(new Item({ itemInfos: {}, viewChoice: this.getLayout() }));
  }

}

export default Items;