import ItemDecorator from './ItemDecorator.js';
import FocusManagerDecoratorView from './views/FocusManagerDecoratorView.js';
/** @import Component from '../Component.js'; */
/** @import Composite from '../Composite.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */
/** @import Item from '../../components/Item.js'; */

class FocusManagerDecorator extends ItemDecorator {

  name = 'FocusManagerDecorator';

  /** @type {Composite} */
  #conteneur;

  /**
   * @constructor
   * @param {Component} decoratedElement
   * @param {Component} conteneur : liste qui contient l'item
   */
  constructor(decoratedElement, conteneur) {
    super(new FocusManagerDecoratorView(decoratedElement.getView()), decoratedElement);

    this.#conteneur = conteneur;
  }

  /**
   * Modification du modèle
   * @param {'modify'|'added'|'updated'|'toDelete'|'undoToDelete'|'removed'|'addChildItem'|'removeChildItem'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    super.update(action, treeItem);
    if (!this.getDecoratedElement()
      .isOnCurrentBranch()) {
      return;
    }
    if (action === 'added') {
      this.getDecoratedElement()
        .giveFocus();
    } else if (action === 'toDelete' || action === 'removed') {
      this.giveFocusAfterDelete();
    }
  }

  giveFocusAfterDelete() {
    const next = this.getNextActiveItem();
    if (next) {
      next.giveFocus();
    } else {
      const previous = this.getPreviousActiveItem();
      if (previous) {
        previous.giveFocus();
      } else if (this.#conteneur.getParent()) {
        this.#conteneur.getParent()
          .giveFocus();
      } else {
        this.#conteneur.giveFocus();
      }
    }
  }

  getPreviousActiveItem() {
    let previous = this.#conteneur.getPreviousChild(this);
    while (previous) {
      /** @type {Item} */
      const item = previous.getDecoratedElement ? previous.getDecoratedElement() : previous;
      if (item.getTreeItem()
        .isDeleted()) {
        previous = this.#conteneur.getPreviousChild(item);
      } else {
        return item;
      }
    }
    return null;
  }

  getNextActiveItem() {
    let next = this.#conteneur.getNextChild(this);
    while (next) {
      /** @type {Item} */
      const item = next.getDecoratedElement ? next.getDecoratedElement() : next;
      if (item.getTreeItem()
        .isDeleted()) {
        next = this.#conteneur.getNextChild(item);
      } else {
        return item;
      }
    }
    return null;
  }

}

export default FocusManagerDecorator;