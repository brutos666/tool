import SaveItem from './SaveItem.js';
/** @import Item from '../components/Item.js' */

class CreateItem extends SaveItem {

  /**
   * @constructor de la classe CreateItem
   * @param {Item} item - Item
   * @param {string} successMessage - Message de success
   * @param {string} errorMessage - Message d'erreur
   */
  constructor(item) {
    super(item,
          'La tâche a bien été créée',
          'Une erreur est survenue lors de la création de la tâche'
    );
  }

}

export default CreateItem;