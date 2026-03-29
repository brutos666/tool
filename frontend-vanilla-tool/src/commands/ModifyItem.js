import SaveItem from './SaveItem.js';
/** @import Item from '../components/Item.js' */

class ModifyItem extends SaveItem {

  /**
   * @constructor de la classe CreateItem
   * @param {Item} item - Item
   */
  constructor(item) {
    super(item,
          'La tâche a bien été modifiée',
          'Une erreur est survenue lors de la modification de la tâche'
    );
  }

}

export default ModifyItem;