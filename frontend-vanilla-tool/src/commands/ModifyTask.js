import SaveTask from './SaveTask.js';
/** @import TaskCard from '../components/TaskCard.js' */
/** @import TaskContainer from '../components/TaskContainer.js' */

class ModifyTask extends SaveTask {

  /**
   * Constructeur de la classe CreateTask
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskCard} taskCard - Carte de tache
   */
  constructor(taskContainer, taskCard) {
    super(taskContainer,
          taskCard,
          'La tâche a bien été modifiée',
          'Une erreur est survenue lors de la modification de la tâche'
    );
  }

}

export default ModifyTask;