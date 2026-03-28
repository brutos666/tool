import CompositeView from './CompositeView.js';

class TaskCardView extends CompositeView {

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant de la carte
   */
  constructor(data) {
    super(data);
  }
  /**
   * @override {@link CompositeView.getHtmlView}
   */
  getHtmlView(data) {
    const label = data.id === undefined ? '' : data.id;
    return String.raw`
    <div class="task-card">
      <header class="task-card__header">${ label }</header>
      <div id="spaceChildren"></div>
    </div>`;
  }

}

export default TaskCardView;