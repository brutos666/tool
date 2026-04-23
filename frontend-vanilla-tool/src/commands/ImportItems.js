import Command from './Command.js';
import FileCallsRequest from '../requests/FileCallsRequest.js';
import StoreData from '../data/StoreData.js';
/** @import CommandActionDecorator from '../components/decorators/CommandActionDecorator.js'; */

class ImportItems extends Command {

  name = 'ImportItems';

  /**
   * @constructor
   * @param {CommandActionDecorator} actionDecorator
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
    if (treeItemList.getTreeList().length > 0) {
      // MAJ du 1er item
      treeItemList.getLast()
        .updateItem(itemInfosList[0]);
      treeItemList.addItems(treeItem, itemInfosList.slice(1));
    } else {
      treeItemList.addItems(treeItem, itemInfosList);
    }
  }

}

export default ImportItems;