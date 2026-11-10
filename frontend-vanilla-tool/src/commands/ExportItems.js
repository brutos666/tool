import Command from './Command.js';
import FileCallsRequest from '../requests/FileCallsRequest.js';
/** @import CommandDecorator from '../components/decorators/CommandDecorator.js' */

class ExportItems extends Command {

  name = 'ExportItems';

  /**
   * @constructor
   * @param {CommandDecorator} commandDecorator
   * @param {TreeItem} treeItem
   */
  constructor(commandDecorator, treeItem) {
    super(commandDecorator);

    this.setSuccessMessage('Export effectué');
    this.setErrorMessage('Une erreur est survenue lors de l\'export des éléments');
    /** @type {TreeInfos} */
    const treeInfos = {
      item: treeItem.getItemInfos(),
      previousItemId: treeItem.getPrevious()
        ?.getItemId(),
      parentItemId: treeItem.getParentItem()
        ?.getItemId(),
      nextItemId: treeItem.getNext()
        ?.getItemId()
    };
    this.setExecuteCallback(new FileCallsRequest().downloadItemCsv.bind(null, treeInfos));
  }

}

export default ExportItems;