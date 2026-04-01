/** @import NodeElement from './NodeElement.js' */
/** @import CommandDecorator from './CommandDecorator.js' */

/**
 * Cette classe permet d'isoler les actions des composants. Cela permet qu'une touche de raccourci puisse faire la même chose qu'un bouton. Ici on va gérer les erreurs et on gérera le spinner
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
    this.#commandDecoratorElement.commandInProgress(this.name);
    return this.#executeCallback()
      .then(response => {
        this.#commandDecoratorElement.commandDone(this.name, response);
        this.#commandDecoratorElement.setSuccess(this.#successMessage);
        return Promise.resolve(response);
      }, errorResponse => {
        this.#commandDecoratorElement.commandFailed(this.name);
        this.#commandDecoratorElement.setError(`${ this.#errorMessage } : ${ errorResponse }`);
        return Promise.reject(errorResponse);
      });
  }

}

export default Command;