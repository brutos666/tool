import DeleteItem from '../../commands/DeleteItem.js';
import CommandSpaceDecorator from './CommandSpaceDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';
/** @import Tree from './Tree.js' */
/** @import TreeItem from '../../data/TreeItem.js' */

/**
 * Le décorateur se charge de la suppression d'un item. Il sera positionner au niveau de l'élément qui agit sur l'item pour pouvoir gérer les erreurs et le spinner au bon endroit.
 * L'action de sauvegarde et mise à jour se fait en revanche sur le modèle de données
 */
class CommandDeleteDecorator extends CommandSpaceDecorator {

  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {Items} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   */
  constructor(decoratedElement, data) {
    super(new CommandDecoratorView(decoratedElement.getView()), decoratedElement);
    this.#treeItem = data.treeItem;
    /** @type {Items} */
    const items = this.getOriginalElement();
    items.doDelete = treeItem => this.doDelete(treeItem);
  }
  getTreeItem() {
    return this.#treeItem;
  }
  setTreeItem(treeItem) {
    this.#treeItem = treeItem;
  }

  /**
   *
   * @param {TreeItem} treeItemToRemove
   */
  doDelete(treeItemToRemove) {
    this.setRelaunchCallback(() => {
      this.doDelete();
    });
    return new DeleteItem(this, treeItemToRemove)
      .execute()
      .then(itemInfos => {
        const previous = treeItemToRemove.getPrevious();
        previous.updateItem({ nextId: treeItemToRemove.getNextId() });
        this.#treeItem.removeItem(treeItemToRemove);
        return Promise.resolve(itemInfos);
      });
  }

}

export default CommandDeleteDecorator;