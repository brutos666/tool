import Command from './Command.js';
import { saveTask } from '../requests/taskRequests.js';
/** @import { TaskInfos } from '../components/Task.js' */
/** @import TaskCard from '../components/TaskCard.js' */

class ModifyTask extends Command {

  #taskCard;

  /**
   * Constructeur de la classe CreateTask
   * @param {TaskCard} taskCard - Carte de tache
   */
  constructor(taskCard) {
    super(taskCard,
          'La tâche a bien été modifiée',
          'Une erreur est survenue lors de la modification de la tâche',
          saveTask.bind(null, taskCard.getTaskInfos())
    );

    this.#taskCard = taskCard;
  }

  async execute() {
    super.execute()
      .then(() => {
        this.#taskCard.setBased();
      });
  }

}

export default ModifyTask;