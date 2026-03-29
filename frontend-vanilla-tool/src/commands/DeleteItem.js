import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import ClearItem from './ClearItem.js';
/** @import Item from '../components/Item.js' */

class DeleteItem extends ClearItem {

  /**
   * @constructor de la classe DeleteItem
   * @param {Item} item - Item
   */
  constructor(item) {
    super(item);

    this.setExecuteCallback(new ItemCallsRequests().deleteItem.bind(null, item.getItemInfos()));
  }

}

export default DeleteItem;