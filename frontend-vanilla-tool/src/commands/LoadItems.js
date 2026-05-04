import StoreData from '../data/StoreData.js';
import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import Command from './Command.js';
/** @import CommandDecorator from '../components/decorators/CommandDecorator.js' */

class LoadItems extends Command {

  name = 'LoadItems';

  /**
   * @constructor
   * @param {CommandDecorator} commandItemsDecorator
   */
  constructor(commandItemsDecorator) {
    super(commandItemsDecorator);

    this.setSuccessMessage('Chargement effectué');
    this.setErrorMessage('Une erreur est survenue lors du chargement des éléments');
    this.setExecuteCallback(new ItemCallsRequests().getAllItems.bind(null));
  }
  /**
   * @override
   * @param {Array<ItemInfos>} itemInfosList
   */
  commandDone(itemInfosList) {
    super.commandDone();
    StoreData.storeItems(itemInfosList);
  }

}

export default LoadItems;