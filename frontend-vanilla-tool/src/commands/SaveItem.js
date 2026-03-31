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

    if (item.isNew()) {
      this.setSuccessMessage('La tâche a bien été crée');
      this.setErrorMessage('Une erreur est survenue lors de la crée de la tâche');
    } else {
      this.setSuccessMessage('La tâche a bien été modifiée');
      this.setErrorMessage('Une erreur est survenue lors de la modification de la tâche');
    }

    this.setExecuteCallback(new ItemCallsRequests().saveItem.bind(null, item.getItemInfos()));
  }

  /**
   * @override
   */
  execute() {
    this.#item.saveInProgress();
    return super.execute()
      .then(itemInfos => {
        this.#item.saveDone(itemInfos);
      }, () => {
        this.#item.saveFailed();
      });
  }

}

export default SaveItem;