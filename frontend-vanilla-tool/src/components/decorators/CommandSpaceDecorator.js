import ExportItems from '../../commands/ExportItems.js';
import ImportItems from '../../commands/ImportItems.js';
import LoadItems from '../../commands/LoadItems.js';
import SaveItem from '../../commands/SaveItem.js';
import ActionButton from '../ActionButton.js';
import CommandDecorator from './CommandDecorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';

/**
 * Cette classe permet de décorer un espace pour lequel on aura besoin d'un bouton relancer en cas d'échec de la commande
 */
class CommandSpaceDecorator extends CommandDecorator {

  #relaunchButton;
  #relaunchCallback = null;

  /**
   * @constructor
   * @param {Tree} decoratedElement
   * @param {Object} data
   * @param {TreeItem} data.treeItem
   */
  constructor(decoratedElement, data) {
    super(new CommandDecoratorView(decoratedElement.getView()), decoratedElement, data);
    this.#relaunchButton = new ActionButton({
      id: 'relaunchButton',
      label: 'Relancer'
    });
    this.#relaunchButton.setDoActionCallback(() => {
      this.#relaunchCallback();
    });
    this.#relaunchButton.setHidden();
    this.setStaticChild('relaunch', this.#relaunchButton);
  }

  setRelaunchCallback(callback) {
    this.#relaunchCallback = callback;
  }

  /** @override */
  commandInProgress(name, command) {
    this.#relaunchButton.setHidden();
    if (this.#relaunchCallback === null) {
      this.#relaunchCallback = () => {
        command.execute();
      };
    }
    super.commandInProgress(name);
  }
  /** @override */
  commandDone(name, response) {
    super.commandDone(name, response);
    this.#relaunchCallback = null;
    this.#relaunchButton.setHidden();
  }
  commandFailed(name, error) {
    super.commandFailed(name, error);
    this.#relaunchButton.setVisible();
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

export default CommandSpaceDecorator;