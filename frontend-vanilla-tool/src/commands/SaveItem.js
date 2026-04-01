import Command from './Command.js';
import ItemCallsRequests from '../requests/ItemCallsRequests.js';
/** @import Item from '../components/Item.js' */

class SaveItem extends Command {

  name = 'SaveItem';

  /**
   * @constructor de la classe CreateItem
   * @param {Item} item - Item
   */
  constructor(item) {
    super(item);
    if (item.isNew()) {
      this.setSuccessMessage('La tâche a bien été crée');
      this.setErrorMessage('Une erreur est survenue lors de la crée de la tâche');
    } else {
      this.setSuccessMessage('La tâche a bien été modifiée');
      this.setErrorMessage('Une erreur est survenue lors de la modification de la tâche');
    }

    this.setExecuteCallback(new ItemCallsRequests().saveItem.bind(null, item.getItemInfos()));
  }

}

export default SaveItem;