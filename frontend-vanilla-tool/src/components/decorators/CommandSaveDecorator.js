import SaveItem from '../../commands/SaveItem.js';
import CommandSpaceDecorator from './CommandSpaceDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import Tree from './Tree.js' */
/** @import TreeItem from '../../data/TreeItem.js' */
/** @import {ItemInfos} from '../../data/TreeItem.js' */

/**
 * @typedef {Object} ItemToSave - Informations sur l'item
 * @property {ItemInfos} item - Item à sauvegarder avec ses enfants
 * @property {ItemInfos} previousItem - Item précédent
 * @property {number} nextItemId - Identifiant de l'item suivant
 */

/**
 * Le décorateur se charge de la sauvegarde (création, modification, suppression) de la racine et de la descendance d'un item. Il sera positionner au niveau de l'élément qui agit sur l'item pour pouvoir gérer les erreurs et le spinner au bon endroit.
 * L'action de sauvegarde et mise à jour se fait en revanche sur le modèle de données
 */
class CommandSaveDecorator extends CommandSpaceDecorator {

  /** @type {TreeItem} */
  #treeItem;

  /** @type {TreeItem} */
  #previousItem;
  /** @type {ItemToSave} */
  #itemToSave;

  /**
   * @constructor
   * @param {Tree} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   */
  constructor(decoratedElement, data) {
    super(new CommandDecoratorView(decoratedElement.getView()), decoratedElement);
    this.#treeItem = data.treeItem;
  }
  getTreeItem() {
    return this.#treeItem;
  }
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
  }

  /**
   * @override
   * @param {string} name
   * @param {ItemToSave} itemToSaveResult
   */
  commandDone(name, itemToSaveResult) {
    super.commandDone(name, itemToSaveResult);

    if (this.#previousItem) {
      this.#previousItem.updateItem(itemToSaveResult.previousItem);
    }
    this.#treeItem.updateItem(itemToSaveResult.item);
    const treeItemList = this.#treeItem.getTreeItemList();
    treeItemList.setItems(this.#treeItem, itemToSaveResult.item.children);
  }

  /**
   * Sauvegarde d'un item et de ses enfants
   */
  doSave() {
    this.setRelaunchCallback(() => {
      this.doSave();
    });
    this.#previousItem = this.#treeItem.getPrevious();
    this.#itemToSave = {
      item: this.#treeItem.getItemInfos(),
      previousItem: this.#previousItem?.getItemInfos(),
      nextItemId: this.#treeItem.getNext()
        ?.getItemId()
    };
    return new SaveItem(this, this.#itemToSave)
      .execute();
  }

}

export default CommandSaveDecorator;