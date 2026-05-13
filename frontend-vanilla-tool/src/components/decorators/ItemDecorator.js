import Decorator from './Decorator.js';
/** @import Component from '../Component.js'; */

/**
 * Cette classe permet de décorer un item avec un autre objet
 */
class ItemDecorator extends Decorator {

  name = 'ItemDecorator';

  #decoratedElementUpdateFunction;

  constructor(view, decoratedElement) {
    super(view, decoratedElement);

    // Ajout du comportement de positionnement du noeud lorsque des actions sont effectuées sur l'item
    this.#decoratedElementUpdateFunction = decoratedElement.update.bind(decoratedElement);
    this.getDecoratedElement()
      .update = this.update.bind(this);
  }
  /**
   * Modification du modèle
   * @param {'modify'|'added'|'updated'|'toDelete'|'undoToDelete'|'removed'|'addChildItem'|'removeChildItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    this.#decoratedElementUpdateFunction(action, treeItem);
  }

  setTreeItem(treeItem) {
    this.getDecoratedElement()
      .setTreeItem(treeItem);
  }

}

export default ItemDecorator;