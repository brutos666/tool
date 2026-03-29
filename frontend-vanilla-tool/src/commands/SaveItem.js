import Command from './Command.js';
import ItemCallsRequests from '../requests/ItemCallsRequests.js';
/** @import Item from '../components/Item.js' */

class SaveItem extends Command {

  #item;

  /**
   * @constructor de la classe CreateItem
   * @param {Item} item - Item
   * @param {string} successMessage - Message de success
   * @param {string} errorMessage - Message d'erreur
   */
  constructor(item, successMessage, errorMessage) {
    super(item, successMessage, errorMessage);
    this.#item = item;

    this.setExecuteCallback(new ItemCallsRequests().saveItem.bind(null, item.getItemInfos()));
  }

  async execute() {
    super.execute()
      .then(itemInfos => {
        this.#item.updateData({ itemInfos });
      });
  }

}

export default SaveItem;