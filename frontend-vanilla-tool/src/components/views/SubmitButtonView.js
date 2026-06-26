import ActionButtonView from './ActionButtonView.js';

class SubmitButtonView extends ActionButtonView {

  /**
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.icon - Icône du bouton
   */
  constructor(data) {
    super({ id: data.id, label: data.label, role: 'button', type: 'primary' });
    this.getElementView()
      .setAttribute('type', 'submit');
  }

}
export default SubmitButtonView;