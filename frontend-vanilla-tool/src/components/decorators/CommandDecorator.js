import ActionButton from '../ActionButton.js';
import Decorator from './Decorator.js';
/** @import CommandDecoratorView from './views/CommandDecoratorView.js'; */

class CommandDecorator extends Decorator {

  name = 'CommandDecorator';

  #commandInProgress = false;
  #relaunchButton;

  #relaunchCallback = null;

  /**
   * @constructor
   * @param {CommandDecoratorView} view
   * @param {Component} decoratedElement
   */
  constructor(view, decoratedElement) {
    super(view, decoratedElement);

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

  /**
   * @override
   * @returns {CommandDecoratorView}
   */
  getView() {
    return super.getView();
  }

  setRelaunchCallback(callback) {
    this.#relaunchCallback = callback;
  }
  getRelaunchCallback() {
    return this.#relaunchCallback;
  }

  isCommandInProgress() {
    return this.#commandInProgress;
  }

  /**
   * Cette méthode est appelée lorsque la commande est en cours
   * @param {string} name - Nom de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandInProgress(name) {
    this.#commandInProgress = true;
    this.#relaunchButton.setHidden();

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
    this.#relaunchButton.setHidden();
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
    this.#relaunchButton.setVisible();
  }

  setInProgress() {
    this.getView()
      .clearMessage();
  }

  setError(value) {
    this.getView()
      .setError(value);
  }

  setSuccess(value) {
    this.getView()
      .setSuccess(value);
  }

}

export default CommandDecorator;