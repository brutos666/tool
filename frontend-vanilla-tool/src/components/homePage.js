import createHomeView from '../views/homeView.js';
import { getTodayTask } from '../requests/taskRequests.js';

/**
 * Cette classe est responsable de la création de la vue et de sa mise à jour.
 * Elle contient les propriétés du modèle de la vue et c'est bien ici que le modèle doit être mis à jour.
 * Lors de sa mise à jour, il doit indiquer à la vue de se mettre à jour.
 * @returns la vue
 */
function createHomePage() {
  const onTaskClick = () => {
    const dataTask = getTodayTask();
    view.updateInput(dataTask);
  };

  const viewProps = { onTaskClick };
  const view = createHomeView(viewProps);
  return view;
}

export default createHomePage;
