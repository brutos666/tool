import Command from './Command.js';
import FileCallsRequest from '../requests/FileCallsRequest.js';
import StoreData from '../data/StoreData.js';
/** @import CommandDecorator from '../components/decorators/CommandDecorator.js'; */

class ImportItems extends Command {

  name = 'ImportItems';

  /**
   * @constructor
   * @param {CommandDecorator} actionDecorator
   * @param {FileUpload} fileUpload
   */
  constructor(actionDecorator, fileUpload) {
    super(actionDecorator);

    this.setSuccessMessage('Import effectué');
    this.setErrorMessage('Une erreur est survenue lors de l\'import des éléments');
    this.setExecuteCallback(new FileCallsRequest().uploadCsv.bind(null, fileUpload));
  }
  /**
   * @override
   * @param {Array<ItemInfos>} itemInfosList
   */
  commandDone(itemInfosList) {
    super.commandDone(itemInfosList);

    const treeItem = StoreData.getTreeItem();
    const treeItemList = treeItem.getTreeItemList();
    treeItemList.addItems(treeItem, itemInfosList);
  }

}

export default ImportItems;