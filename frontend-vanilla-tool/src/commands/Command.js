/** @import NodeElement from './NodeElement.js' */

/**
 * Cette classe permet d'isoler les actions des composants. Cela permet qu'une touche de raccourci puisse faire la même chose qu'un bouton. Ici on va gérer les erreurs et on gérera le spinner
 */
class Command {

  name = 'Command';

  #targetNodeElement;
  #successMessage;
  #errorMessage;
  #executeCallback;

  /**
   * @constructor
   * @param {NodeElement} targetNodeElement - Element cible
   */
  constructor(targetNodeElement) {
    this.#targetNodeElement = targetNodeElement;
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
    this.#targetNodeElement.commandInProgress(this.name);
    return this.#executeCallback()
      .then(response => {
        this.#targetNodeElement.commandDone(this.name, response);
        this.#targetNodeElement.setSuccess(this.#successMessage);
        return Promise.resolve(response);
      }, errorResponse => {
        this.#targetNodeElement.commandFailed(this.name);
        this.#targetNodeElement.setError(`${ this.#errorMessage } : ${ errorResponse }`);
        return Promise.reject(errorResponse);
      });
  }

}

export default Command;