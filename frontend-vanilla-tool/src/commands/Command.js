/** @import NodeElement from './NodeElement.js' */
/** @import CommandDecorator from '../components/decorators/CommandDecorator.js' */

/**
 * Cette classe permet d'isoler les actions des composants. Cela permet qu'une touche de raccourci puisse faire la même chose qu'un bouton. Ici on va gérer les erreurs et on gérera le spinner
 * Le décorateur doit contenir l'élément sur lequel agit la commande. Il va gérer le spinner, le message d'erreur, etc...
 */
class Command {

  name = 'Command';

  #commandDecoratorElement;
  #successMessage;
  #errorMessage;
  #executeCallback;

  /**
   * @constructor
   * @param {CommandDecorator} commandDecoratorElement - Element cible
   */
  constructor(commandDecoratorElement) {
    this.#commandDecoratorElement = commandDecoratorElement;
    this.#executeCallback = () => { return Promise.resolve(); };
  }

  /**
   * Retourne le décorateur qui s'occupe du comportement d'une commande effectuée sur un item (spinner, erreur, etc...)
   * @returns {CommandDecorator}
   */
  getCommandDecoratorElement() {
    return this.#commandDecoratorElement;
  }

  /**
   * Positionne la fonction à appeler lorsque la commande est exécutée
   * @param {Function} executeCallback - Fonction appelée lorsque la commande est exécutée
   */
  setExecuteCallback(executeCallback) {
    this.#executeCallback = executeCallback;
  }

  /**
   * Positionne le message de success
   * @param {string} successMessage - Message de success
   */
  setSuccessMessage(successMessage) {
    this.#successMessage = successMessage;
  }
  /**
   * Positionne le message d'erreur
   * @param {string} errorMessage - Message d'erreur
   */
  setErrorMessage(errorMessage) {
    this.#errorMessage = errorMessage;
  }
  /**
   * Exécuter la commande
   * @returns {Promise}
   */
  async execute() {
    const commandDecorator = this.getCommandDecoratorElement();
    if (commandDecorator.isCommandInProgress()) {
      alert('Attendre que la commande soit terminée !!');
      return;
    }
    commandDecorator.commandInProgress(this.name, this);
    commandDecorator.setInProgress();
    return this.#executeCallback()
      .then(response => {
        commandDecorator.commandDone(this.name, response);
        commandDecorator.setSuccess(this.#successMessage);
        return Promise.resolve(response);
      }, errorResponse => {
        commandDecorator.commandFailed(this.name);
        commandDecorator.setError(`${ this.#errorMessage } : ${ errorResponse }`);
        return Promise.reject(errorResponse);
      });
  }

}

export default Command;