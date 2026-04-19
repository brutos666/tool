import Command from './Command.js';
import ItemCallsRequests from '../requests/ItemCallsRequests.js';
/** @import CommandSaveDecorator from '../components/decorators/CommandSaveDecorator.js'; */
/** @import ItemToSave from '../components/decorators/CommandSaveDecorator.js' */

class SaveItem extends Command {

  name = 'SaveItem';

  /**
   * @constructor de la classe CreateItem
   * @param {CommandSaveDecorator} commandItemDecorator - Item
   * @param {ItemToSave} itemToSave
   */
  constructor(commandItemDecorator, itemToSave) {
    super(commandItemDecorator);

    this.setSuccessMessage('Les modifications ont bien été enregistrées');
    this.setErrorMessage('Une erreur est survenue lors de la sauvegarde des modifications');

    this.setExecuteCallback(new ItemCallsRequests().saveItem.bind(null, itemToSave));
  }

}

export default SaveItem;