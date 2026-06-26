import ActionView from './ActionView.js';

class ActionButtonView extends ActionView {

  name = 'ActionButtonView';

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.icon - Icône du bouton
   * @param {string} data.role - Rôle du bouton
   * @param {icon|menu|label|primary} data.type - Type de bouton
   */
  constructor(data) {
    super(data);
    this.getElementView().classList.add(`${ data.type }-button`);
    this.getElementView().classList.add('action__button');
  }

}
export default ActionButtonView;