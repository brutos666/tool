import DeleteItem from '../../commands/DeleteItem.js';
import CommandItemDecoratorView from './views/CommandItemDecoratorView.js';
import { RIGHT } from '../../tools/Constants.js';
import SaveItem from '../../commands/SaveItem.js';
import ItemCallsRequests from '../../requests/ItemCallsRequests.js';
import CommandSpaceDecorator from './CommandSpaceDecorator.js';
/** @import Tree from './Tree.js' */
/** @import TreeItem from '../../data/TreeItem.js' */
/** @import {ItemInfos} from '../../data/TreeItem.js' */

/**
 * Le décorateur se charge de la sauvegarde (création, modification, suppression) d'un item. Il sera positionner au niveau de l'élément qui agit sur l'item pour pouvoir gérer les erreurs et le spinner au bon endroit.
 * L'action de sauvegarde et mise à jour se fait en revanche sur le modèle de données
 */
class CommandItemDecorator extends CommandSpaceDecorator {

  /** @type {TreeItem} */
  #treeItem;

  /** @type {Array<RIGHT>} */
  #rights;

  /**
   * @constructor
   * @param {Tree} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   * @param {Array<RIGHT>} data.rights - Droits en création, modification et suppression
   */
  constructor(decoratedElement, data) {
    super(new CommandItemDecoratorView(decoratedElement.getView()), decoratedElement);
    this.#treeItem = data.treeItem;
    this.#rights = data.rights;

    if (data.rights.includes(RIGHT.update)) {
      this.getView()
        .setOnBlurCallback(this.doSave.bind(this));
    }
    if (data.rights.includes(RIGHT.delete)) {
      // L'élément décoré doit avoir la fonction qui supprime l'item
      decoratedElement.getOriginalElement().doDelete = this.doDelete.bind(this);
    }
  }
  getTreeItem() {
    return this.#treeItem;
  }
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
  }
  /**
   * @override
   * @param {string} name - Nom de la commande
   */
  commandInProgress(name) {
    super.commandInProgress(name);

    if (name === 'SaveItem') {
      // Ne plus lancer la sauvegarde lors de la perte de focus tant que la commande est en cours
      this.getView()
        .setOnBlurCallback(() => {});
    }
  }
  /**
   * @override
   * @param {string} name - Nom de la commande
   * @param {ItemInfos} itemInfos - Informations sur la tache
   */
  commandDone(name, itemInfos) {
    super.commandDone(name, itemInfos);

    if (name === 'SaveItem') {
      this.getView()
        .setOnBlurCallback(this.doSave.bind(this));
    }
  }

  /**
   * Sauvegarde d'un item
   */
  doSave() {
    if (!this.#treeItem.isNew() && !this.#treeItem.isModified()) {
      return;
    }
    if (!this.#rights.includes(RIGHT.update)) {
      return;
    }
    this.setRelaunchCallback(() => {
      this.doSave();
    });
    return new SaveItem(this, this.#treeItem)
      .execute()
      .then(itemInfos => {
        const previousTreeItem = this.#treeItem.getPrevious();
        this.#treeItem.updateItem(itemInfos);
        if (previousTreeItem?.isModified()) {
          return new ItemCallsRequests()
            .saveItem(previousTreeItem.getItemInfos())
            .then(previousItemInfos => {
              previousTreeItem.updateItem(previousItemInfos);
              return Promise.resolve(itemInfos);
            });
        }
        return Promise.resolve(itemInfos);
      });
  }

  /**
   *
   * @param {} action
   * @param {*} treeItem
   * @returns
   */
  doDelete() {
    if (!this.#rights.includes(RIGHT.delete)) {
      return;
    }
    this.setRelaunchCallback(() => {
      this.doDelete();
    });
    return new DeleteItem(this)
      .execute()
      .then(itemInfos => {
        const previousTreeItem = this.#treeItem.getPrevious();
        this.#treeItem.deleteItem();
        if (previousTreeItem) {
          return new ItemCallsRequests()
            .saveItem(previousTreeItem.getItemInfos())
            .then(previousItemInfos => {
              previousTreeItem.updateItem(previousItemInfos);
              return Promise.resolve(itemInfos);
            });
        }
        return Promise.resolve(itemInfos);
      });
  }

}

export default CommandItemDecorator;