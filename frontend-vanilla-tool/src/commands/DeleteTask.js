import Command from './Command.js';
import { deleteTask } from '../requests/taskRequests.js';
/** @import { TaskInfos } from '../components/Task.js' */
/** @import TaskContainer from '../components/TaskContainer.js' */

class DeleteTask extends Command {

  /**
   * Constructeur de la classe DeleteTask
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskInfos} taskInfos - Tâche à supprimer
   */
  constructor(taskContainer, taskInfos) {
    super(taskContainer,
          'La tâche a bien été supprimée',
          'Une erreur est survenue lors de la suppression de la tâche',
          deleteTask.bind(null, taskInfos)
    );
  }

}

export default DeleteTask;