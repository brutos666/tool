import Decorator from './Decorator.js';
/** @import CommandDecoratorView from './views/CommandDecoratorView.js'; */

class CommandDecorator extends Decorator {

  name = 'CommandDecorator';

  /**
   * @constructor
   * @param {CommandDecoratorView} view
   * @param {Component} element
   */
  constructor(view, element) {
    super(view, element);
  }

  /**
   * @override
   * @returns {CommandDecoratorView}
   */
  getView() {
    return super.getView();
  }

  setError(value) {
    this.getView()
      .setError(value);
  }

  setSuccess(value) {
    this.getView()
      .setSuccess(value);
  }

  /**
   * Cette méthode est appelée lorsque la commande est en cours
   * @param {string} name - Nom de la commande
   */
  // eslint-disable-next-line no-unused-vars
  commandInProgress(name) {
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
    this.getView()
      .showSpinner();
  }

}

export default CommandDecorator;