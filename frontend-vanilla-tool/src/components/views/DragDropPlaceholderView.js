import View from './View.js';

class DragDropPlaceholderView extends View {

  name = 'DragDropPlaceholderView';

  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.overId - Identifiant
   * @param {'before'|'after'} data.position - position
   */
  constructor(data) {
    super(data);
  }

  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.overId - Identifiant
   * @param {'before'|'after'} data.position - position
   * @returns {string} - Code HTML du champ
   */
  getHtmlView(data) {
    return String.raw`<div class="placeholder " data-over-id="${ data.overId }" position="${ data.position }"></div>`;
  }

}
export default DragDropPlaceholderView;