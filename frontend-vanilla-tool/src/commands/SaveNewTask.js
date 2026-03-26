import Command from './Command.js';
import { saveTask } from '../requests/taskRequests.js';
import { ACTION } from '../tools/Constants.js';
/** @import { TaskInfos } from '../components/Task.js' */
/** @import TaskCard from '../components/TaskCard.js' */

class SaveNewTask extends Command {

  #taskCard;
  #taskContainer;

  /**
   * Constructeur de la classe CreateTask
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskCard} taskCard - Carte de tache
   */
  constructor(taskContainer, taskCard) {
    super(taskCard,
          `La tâche a bien été ${ taskCard.getAction() === ACTION.Update ? ' modifiée' : 'créée' }`,
          `Une erreur est survenue lors de la ${ taskCard.getAction() === ACTION.Update ? ' modification' : 'création' } de la tâche`,
          saveTask.bind(null, taskCard.getTaskInfos())
    );

    this.#taskCard = taskCard;
    this.#taskContainer = taskContainer;
  }

  async execute() {
    super.execute()
      .then(task => {
        // Remplacer la carte pour une nouvelle carte
        this.#taskContainer.replaceTask(this.#taskCard, task);
      });
  }

}

export default SaveNewTask;