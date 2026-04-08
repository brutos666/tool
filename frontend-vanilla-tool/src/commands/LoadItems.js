import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import Command from './Command.js';
/** @import Items from '../components/Items.js'; */
/** @import CommandItemsDecorator from '../components/decorators/CommandItemsDecorator.js' */

class LoadItems extends Command {

  name = 'LoadItems';

  /**
   * @constructor
   * @param {CommandItemsDecorator} commandItemsDecorator
   */
  constructor(commandItemsDecorator) {
    super(commandItemsDecorator);

    this.setSuccessMessage('Chargement effectué');
    this.setErrorMessage('Une erreur est survenue lors du chargement des éléments');
    this.setExecuteCallback(new ItemCallsRequests().getAllItems.bind(null));
  }

}

export default LoadItems;