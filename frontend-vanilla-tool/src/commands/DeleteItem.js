import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import Command from './Command.js';
/** @import Item from '../components/Item.js' */

class DeleteItem extends Command {

  name = 'DeleteItem';

  /**
   * @constructor de la classe DeleteItem
   * @param {Item} item - Item
   */
  constructor(item) {
    super(item);

    if (item.isNew()) {
      this.setSuccessMessage('La tâche a bien été retirée');
      this.setErrorMessage('Une erreur est survenue lors de la suppression de la tâche');
      return;
    }
    this.setSuccessMessage('La tâche a bien été supprimée');
    this.setErrorMessage('Une erreur est survenue lors de la suppression de la tâche');
    this.setExecuteCallback(new ItemCallsRequests().deleteItem.bind(null, item.getItemInfos()));
  }

}

export default DeleteItem;