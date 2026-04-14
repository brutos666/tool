import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import Command from './Command.js';
/** @import Item from '../components/Item.js' */
/** @import CommandItemDecorator from '../components/decorators/CommandItemDecorator.js' */

class DeleteItem extends Command {

  name = 'DeleteItem';

  /**
   * @constructor de la classe DeleteItem
   * @param {CommandItemDecorator} commandItemDecorator - Item
   * @param {TreeItem} treeItemToRemove
   */
  constructor(commandItemDecorator, treeItemToRemove) {
    super(commandItemDecorator);
    if (treeItemToRemove.isNew()) {
      this.setSuccessMessage('La tâche a bien été retirée');
      this.setErrorMessage('Une erreur est survenue lors de la suppression de la tâche');
      return;
    }
    this.setSuccessMessage('La tâche a bien été supprimée');
    this.setErrorMessage('Une erreur est survenue lors de la suppression de la tâche');
    this.setExecuteCallback(new ItemCallsRequests().deleteItem.bind(null, treeItemToRemove.getItemInfos()));
  }

}

export default DeleteItem;