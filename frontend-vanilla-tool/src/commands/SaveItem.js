import Command from './Command.js';
import ItemCallsRequests from '../requests/ItemCallsRequests.js';
import { CRUD_MODE } from '../tools/Constants.js';
/** @import CommandDecorator from '../components/decorators/CommandDecorator.js' */
/** @import TreeItem from '../data/TreeItem.js' */
/** @import {TreeInfos} from '../requests/ItemCallsRequests.js' */

class SaveItem extends Command {

  name = 'SaveItem';

  /** @type {TreeItem} */
  #treeItem;
  /**
   * @constructor de la classe CreateItem
   * @param {CommandDecorator} commandDecorator - Item
   * @param {TreeItem} treeItem
   */
  constructor(commandDecorator, treeItem) {
    super(commandDecorator);
    this.#treeItem = treeItem;

    this.setSuccessMessage('Les modifications ont bien été enregistrées');
    this.setErrorMessage('Une erreur est survenue lors de la sauvegarde des modifications');

    /** @type {TreeInfos} */
    const treeInfos = {
      item: this.#treeItem.getItemInfos(),
      previousItemId: this.#treeItem.getPrevious()
        ?.getItemId(),
      parentItemId: this.#treeItem.getParentItem()
        ?.getItemId(),
      nextItemId: this.#treeItem.getNext()
        ?.getItemId()
    };
    this.setExecuteCallback(new ItemCallsRequests().saveItem.bind(null, treeInfos));
  }
  /**
   * @override
   * @param {TreeInfos} treeInfos
   */
  commandDone(treeInfos) {
    super.commandDone(treeInfos);

    if (treeInfos.item.CRUDMode === CRUD_MODE.TO_REMOVE) {
      this.#treeItem.getParentItem()
        .removeChildItem(this.#treeItem);
      return;
    }
    this.#treeItem.updateItem(treeInfos.item);
    const treeItemList = this.#treeItem.getTreeItemList();
    treeItemList.setItems(this.#treeItem, treeInfos.item.children);
  }

}

export default SaveItem;