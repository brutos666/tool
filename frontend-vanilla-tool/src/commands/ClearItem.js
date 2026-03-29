import { NOTIFICATION_TIMEOUT } from '../tools/Constants.js';
import Command from './Command.js';
/** @import Item from '../components/Item.js' */

class ClearItem extends Command {

  #item;

  /**
   * @constructor de la classe
   * @param {Item} item - Item
   */
  constructor(item) {
    super(item,
          'La tâche a bien été supprimée',
          'Une erreur est survenue lors de la suppression de la tâche'
    );
    this.#item = item;
  }

  async execute() {
    super.execute()
      .then(() => {
        // Grise la carte pendant quelque temps
        this.#item.setDisabled(true);
        setTimeout(() => this.#item.doRemoveFromParent(), NOTIFICATION_TIMEOUT);
      });
  }

}

export default ClearItem;