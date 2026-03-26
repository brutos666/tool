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
   * @param {Function} executeCallback - Fonction appelée lorsque la commande est exécutée
   */
  constructor(targetNodeElement, successMessage, errorMessage, executeCallback) {
    this.#targetNodeElement = targetNodeElement;
    this.#successMessage = successMessage;
    this.#errorMessage = errorMessage;
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
      .then(task => {
        this.#targetNodeElement.setSuccess(this.#successMessage);
        return task;
      }, errorResponse => {
        this.#targetNodeElement.setError(`${ this.#errorMessage } : ${ errorResponse }`);
        return errorResponse;
      });
  }

}

export default Command;