import Command from './Command.js';
import { saveTask } from '../requests/taskRequests.js';
/** @import TaskCard from '../components/TaskCard.js' */
/** @import TaskContainer from '../components/TaskContainer.js' */

class SaveTask extends Command {

  #taskCard;
  /** @type {TaskContainer} */
  #taskContainer;

  /**
   * @constructor de la classe CreateTask
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskCard} taskCard - Carte de tache
   * @param {string} successMessage - Message de success
   * @param {string} errorMessage - Message d'erreur
   */
  constructor(taskContainer, taskCard, successMessage, errorMessage) {
    super(taskCard,
          successMessage,
          errorMessage,
          saveTask.bind(null, taskCard.getTaskInfos())
    );

    this.#taskCard = taskCard;
    this.#taskContainer = taskContainer;
  }

  async execute() {
    super.execute()
      .then(taskInfos => {
        // Remplacer la carte pour la nouvelle carte ou la carte modifiée
        this.#taskContainer.updateData(this.#taskCard, taskInfos);
      });
  }

}

export default SaveTask;