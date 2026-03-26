import SaveTask from './SaveTask.js';
/** @import TaskCard from '../components/TaskCard.js' */
/** @import TaskContainer from '../components/TaskContainer.js' */

class CreateTask extends SaveTask {

  /**
   * Constructeur de la classe CreateTask
   * @param {TaskContainer} taskContainer - Conteneur des tâches
   * @param {TaskCard} taskCard - Carte de tache
   * @param {string} successMessage - Message de success
   * @param {string} errorMessage - Message d'erreur
   */
  constructor(taskContainer, taskCard) {
    super(taskContainer,
          taskCard,
          'La tâche a bien été créée',
          'Une erreur est survenue lors de la création de la tâche'
    );
  }

}

export default CreateTask;