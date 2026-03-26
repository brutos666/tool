import Command from './Command.js';
/** @import TaskCard from '../components/TaskCard.js' */
/** @import TaskContainer from '../components/TaskContainer.js' */

class ClearTask extends Command {

  #taskCard;
  #taskContainer;

  /**
   * Constructeur de la classe
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskCard} taskCard - Carte de tache
   * @param {Function} executeCallback - Fonction appelée lorsque la commande est exécutée
   */
  constructor(taskContainer, taskCard, executeCallback) {
    super(taskContainer,
          'La tâche a bien été supprimée',
          'Une erreur est survenue lors de la suppression de la tâche',
          executeCallback
    );

    this.#taskCard = taskCard;
    this.#taskContainer = taskContainer;
  }

  async execute() {
    super.execute()
      .then(() => {
        // Supprimer la carte pour la carte
        this.#taskContainer.removeChild(this.#taskCard);
      });
  }

}

export default ClearTask;