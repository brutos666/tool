import StoreData from '../data/StoreData.js';
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
  /**
   * @override
   * @param {Array<ItemInfos>} itemInfosList
   */
  commandDone(itemInfosList) {
    super.commandDone();

    if (itemInfosList.length === 0) {
      itemInfosList.push({ id: undefined, title: 'Nouvel espace', text: '', state: 'TODO', parentId: undefined, children: [] });
    }
    StoreData.storeItems(itemInfosList);
  }

}

export default LoadItems;