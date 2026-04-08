import ActionButton from '../ActionButton.js';
import CommandDecorator from './CommandDecorator.js';
import CommandItemDecoratorView from './views/CommandItemDecoratorView.js';
import SaveItem from '../../commands/SaveItem.js';
import DeleteItem from '../../commands/DeleteItem.js';
/** @import Item from '../Item.js'; */
/** @import TreeItem from '../../data/TreeItem.js'; */
/** @import {ItemInfos} from '../data/TreeItem.js'; */

/**
 * Le décorateur se charge de la sauvegarde d'un item. Il met à jour l'item.
 * En revanche, il ne doit pas interférer dans la hiérarchie parent/enfant des items
 */
class CommandItemDecorator extends CommandDecorator {

  name = 'CommandItemDecorator';

  /** @type {TreeItem} */
  #treeItem;
  /** @type {Item} */
  #item;

  /**
   * @constructor
   * @param {Item} decoratedElement
   */
  constructor(decoratedElement) {
    super(new CommandItemDecoratorView(decoratedElement.getView()), decoratedElement);
    this.#item = decoratedElement;
    this.#treeItem = decoratedElement.getTreeItem();
    this.#treeItem.addObserver(this);
    this.#treeItem.removeObserver(this.#item);

    this.getView()
      .setOnBlurCallback(this.doSave.bind(this));
  }

  /**
   * @override
   * @returns {CommandItemDecoratorView}
   */
  getView() {
    return super.getView();
  }

  getTreeItem() {
    return this.#treeItem;
  }

  /**
   * @override
   * @param {string} name - Nom de la commande
   * @param {ItemInfos} itemInfos - Informations sur la tache
   */
  commandDone(name, itemInfos) {
    super.commandDone(name, itemInfos);

    if (name === 'SaveItem') {
      this.#treeItem.updateItem(itemInfos);
    }
  }

  /**
   * @override
   */
  commandFailed(name) {
    super.commandFailed(name);

    if (name === 'SaveItem') {
      // Ne plus lancer la sauvegarde lors de la perte de focus sur l'item tant que l'erreur n'a pas été résolue
      this.getView()
        .setOnBlurCallback(() => {});
      this.addChild(getRelaunchSaveButton());
    }
  }

  /**
   * Sauvegarde d'un item
   */
  doSave() {
    if (this.#treeItem.isNew() || this.#treeItem.isModified()) {
      return new SaveItem(this)
        .execute();
    }
  }

  doDelete() {
    return new DeleteItem(this)
      .execute();
  }

  /**
   * Modification du modèle
   * @param {'change'|'update'|'delete'} action
   * @param {TreeItem} treeItem
   */
  update(action, treeItem) {
    if (action === 'update') {
      this.#item.update(action, treeItem);
    } else if (action === 'change') {
      // Si la modification concerne le suivant, il faut immédiatement le sauvegarder
      if (this.#treeItem.isNextIdModified()) {
        this.doSave();
      }
    } else if (action === 'delete') {
      this.doDelete()
        .then(() => {
          this.#item.update(action, treeItem);
        });
    }
  }

}
/**
 * Ajout d'un bouton pour lancer la sauvegarde manuellement
 * @this {CommandItemDecorator}
 */
function getRelaunchSaveButton() {
  /*
   * Si la sauvegarde a échouée, c'est qu'il y a un problème à résoudre. On ne peut pas relancer la sauvegarde automatique tant que le problème est pas résolu. Ajout d'un bouton pour relancer la sauvegarde
   */
  const saveButton = new ActionButton({
    id: 'saveButton',
    label: 'Relancer la sauvegarde'
  });
  saveButton.setDoActionCallback(() => {
    this.doSave()
      .then(() => {
        saveButton.removeFromParent();
        this.getView()
          .setOnBlurCallback(this.doSave.bind(this));
      });
  });
  return saveButton;
}
export default CommandItemDecorator;