import ExportItems from '../../commands/ExportItems.js';
import ImportItems from '../../commands/ImportItems.js';
import LoadItems from '../../commands/LoadItems.js';
import SaveItem from '../../commands/SaveItem.js';
import Decorator from './Decorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';

class CommandDecorator extends Decorator {

  name = 'CommandDecorator';

  #commandInProgress = false;
  /** @type {TreeItem} */
  #treeItem;

  /**
   * @constructor
   * @param {Component} decoratedElement
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
   * @returns {CommandDecoratorView}
   */
  getView() {
    return super.getView();
  }

  isCommandInProgress() {
    return this.#commandInProgress;
  }

  /**
   * Cette méthode est appelée lorsque la commande est en cours
   * @param {string} name - Nom de la commande
   * @param {Command} command - commande en cours
   */
  // eslint-disable-next-line no-unused-vars
  commandInProgress(name/* , command*/) {
    this.#commandInProgress = true;

    this.getDecoratedElement()
      .setDisabled();
    this.getView()
      .showSpinner();
  }

  /**
   * Cette méthode est appelée lorsque la commande est terminée
   * @param {string} name - Nom de la commande
   * @param {Object} response - Résultat de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandDone(name, response) {
    this.#commandInProgress = false;
    this.getDecoratedElement()
      .setEnabled();
    this.getView()
      .hideSpinner();
  }

  /**
   * Cette méthode est appelée lorsque la commande a échoué
   * @param {string} name - Nom de la commande
   * @param {string} error - Résultat de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandFailed(name, error) {
    this.#commandInProgress = false;
    this.getDecoratedElement()
      .setEnabled();
    this.getView()
      .hideSpinner();
  }

  loadItems() {
    new LoadItems(this)
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
    new ExportItems(this)
      .execute();
  }

  importItems(fileUpload) {
    new ImportItems(this, fileUpload)
      .execute();
  }

}

export default CommandDecorator;