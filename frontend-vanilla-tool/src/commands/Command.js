/** @import NodeElement from './NodeElement.js' */

/**
 * Cette classe permet d'isoler les actions des composants. Cela permet qu'une touche de raccourci puisse faire la même chose qu'un bouton. Ici on va gérer les erreurs et on gérera le spinner
 */
class Command {

  #targetNodeElement;
  #successMessage;
  #errorMessage;
  #executeCallback;

  /**
   *
   * @param {NodeElement} targetNodeElement - Element cible
   * @param {string} successMessage - Message en cas de succès
   * @param {string} errorMessage - Message en cas d'échec
   */
  constructor(targetNodeElement, successMessage, errorMessage) {
    this.#targetNodeElement = targetNodeElement;
    this.#successMessage = successMessage;
    this.#errorMessage = errorMessage;
    this.#executeCallback = () => { return Promise.resolve(); };
  }

  /**
   * Positionne la fonction à appeler lorsque la commande est exécutée
   * @param {Function} executeCallback - Fonction appelée lorsque la commande est exécutée
   */
  setExecuteCallback(executeCallback) {
    this.#executeCallback = executeCallback;
  }

  setSuccessMessage(successMessage) {
    this.#successMessage = successMessage;
  }

  setErrorMessage(errorMessage) {
    this.#errorMessage = errorMessage;
  }

  async execute() {
    return this.#executeCallback()
      .then(response => {
        this.#targetNodeElement.setSuccess(this.#successMessage);
        return Promise.resolve(response);
      }, errorResponse => {
        this.#targetNodeElement.setError(`${ this.#errorMessage } : ${ errorResponse }`);
        return Promise.reject(errorResponse);
      });
  }

}

export default Command;