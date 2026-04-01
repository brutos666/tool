import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import Command from './Command.js';
/** @import ItemsLayout from '../components/ItemsLayout.js'; */

class LoadItems extends Command {

  name = 'LoadItems';

  /**
   * @constructor
   * @param {ItemsLayout} itemsLayout - itemsLayout
   */
  constructor(itemsLayout) {
    super(itemsLayout);

    this.setSuccessMessage('Chargement effectué');
    this.setErrorMessage('Une erreur est survenue lors du chargement des éléments');
    this.setExecuteCallback(new ItemCallsRequests().getAllItems.bind(null));
  }

}

export default LoadItems;