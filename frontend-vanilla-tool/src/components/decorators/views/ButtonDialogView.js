import DecoratorView from './DecoratorView.js';

class ButtonDialogView extends DecoratorView {

  name = 'DialogView';
  constructor(view, data) {
    super(view, data);
  }
  /**
   * @override {@link View.getHtmlView}
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.id - Identifiant du bouton
   * @param {string} data.label - Label du bouton
   * @param {string} data.role - Rôle du bouton
   * @returns {string} - Code HTML du bouton
   */
  getHtmlView(data) {
    return String.raw`<div><button command="show-modal" commandfor="dialog" id="${ data.id }" class="clickable action__button" role="${ data.role }">${ data.label }</button>
    <dialog id="dialog" class="dialog">${ super.getTemplateDecoratorHTML() }
      <button class="clickable" commandfor="dialog" command="close" role="button">Fermer</button>
    </dialog></div>`;
  }

}

export default ButtonDialogView;