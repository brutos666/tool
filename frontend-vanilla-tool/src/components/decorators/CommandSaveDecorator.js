import SaveItem from '../../commands/SaveItem.js';
import CommandSpaceDecorator from './CommandSpaceDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import Tree from './Tree.js' */
/** @import TreeItem from '../../data/TreeItem.js' */
/** @import {ItemInfos} from '../../data/TreeItem.js' */

/**
 * @typedef {Object} TreeInfos - Informations sur l'item
 * @property {ItemInfos} item - Item à sauvegarder avec ses enfants
 * @property {number} previousItemId - Identifiant de l'item précédent
 * @property {number} parentItemId - Identifiant de l'item suivant
 * @property {number} nextItemId - Identifiant de l'item suivant
 */

/**
 * Le décorateur se charge de la sauvegarde (création, modification, suppression) de la racine et de la descendance d'un item. Il sera positionner au niveau de l'élément qui agit sur l'item pour pouvoir gérer les erreurs et le spinner au bon endroit.
 * L'action de sauvegarde et mise à jour se fait en revanche sur le modèle de données
 */
class CommandSaveDecorator extends CommandSpaceDecorator {

  /** @type {TreeItem} */
  #treeItem;

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
   * Sauvegarde d'un item et de ses enfants
   */
  doSave() {
    this.setRelaunchCallback(() => {
      this.doSave();
    });
    return new SaveItem(this, this.#treeItem)
      .execute();
  }

}

export default CommandSaveDecorator;