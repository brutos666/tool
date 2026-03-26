import { deleteTask } from '../requests/taskRequests.js';
import ClearTask from './ClearTask.js';
/** @import TaskCard from '../components/TaskCard.js' */
/** @import TaskContainer from '../components/TaskContainer.js' */

class DeleteTask extends ClearTask {

  /**
   * Constructeur de la classe DeleteTask
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskCard} taskCard - Carte de tache
   */
  constructor(taskContainer, taskCard) {
    super(taskContainer, taskCard, deleteTask.bind(null, taskCard.getTaskInfos()));
  }

}

export default DeleteTask;