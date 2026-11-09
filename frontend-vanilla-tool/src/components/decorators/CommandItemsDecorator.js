import ExportItems from '../../commands/ExportItems.js';
import ImportItems from '../../commands/ImportItems.js';
import LoadItems from '../../commands/LoadItems.js';
import SaveItem from '../../commands/SaveItem.js';
import CommandDecorator from './CommandDecorator.js';

class CommandItemsDecorator extends CommandDecorator {

  name = 'CommandDecorator';

  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {Component} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   */
  constructor(decoratedElement, data) {
    super(decoratedElement);
    this.#treeItem = data.treeItem;
  }
  getTreeItem() {
    return this.#treeItem;
  }
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
  }

  loadItems() {
    return new LoadItems(this)
      .execute();
  }

  /**
   * Sauvegarde d'un item et de ses enfants
   */
  doSave() {
    return new SaveItem(this, this.getTreeItem())
      .execute();
  }

  exportItems() {
    return new ExportItems(this)
      .execute();
  }

  importItems(fileUpload) {
    return new ImportItems(this, fileUpload)
      .execute();
  }

}
export default CommandItemsDecorator;