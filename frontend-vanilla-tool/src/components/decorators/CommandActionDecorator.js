import ExportItems from '../../commands/ExportItems.js';
import ImportItems from '../../commands/ImportItems.js';
import StoreData from '../../data/StoreData.js';
import CommandDecorator from './CommandDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import ActionButton from '../ActionButton.js'; */
/** @import {ItemInfos} from '../../data/TreeItem.js' */

class CommandActionDecorator extends CommandDecorator {

  /**
   * @constructor
   * @param {ActionButton} actionButton - Element décoré
   */
  constructor(actionButton) {
    super(new CommandDecoratorView(actionButton.getView()), actionButton);
  }

  /**
   * @override
   * @param {string} name
   * @param {Array<ItemInfos>} itemInfosList
   */
  commandDone(name, itemInfosList) {
    super.commandDone(name, itemInfosList);
    if (name !== 'ImportItems' || itemInfosList.length === 0) {
      return;
    }
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

  exportItems() {
    new ExportItems(this)
      .execute();
  }

  importItems(fileUpload) {
    new ImportItems(this, fileUpload)
      .execute();
  }

}

export default CommandActionDecorator;