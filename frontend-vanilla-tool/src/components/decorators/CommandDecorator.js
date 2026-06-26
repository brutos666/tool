import Decorator from './Decorator.js';
import CommandDecoratorView from './views/CommandDecoratorView.js';

class CommandDecorator extends Decorator {

  name = 'CommandDecorator';

  #commandInProgress = false;

  /**
   * @constructor
   * @param {Component} decoratedElement
   * @param {Object} data
   */
  constructor(decoratedElement) {
    super(new CommandDecoratorView(decoratedElement.getView()), decoratedElement);
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

}

export default CommandDecorator;