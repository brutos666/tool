import View from './View.js';
import { createNode } from '../../tools/NodeUtilities.js';

class CompositeView extends View {

  /** @type {Element} */
  #spaceChildren;

  /**
   * @constructor. Crée la vue à partir des données passées en paramètre
   * @param {Object} data - Données à utiliser pour créer la vue
   */
  constructor(data) {
    super(data);
    this.#spaceChildren = this.determinateSpaceChildren(this.getElementView());
  }

  /**
   * @override
   */
  getHtmlView(/* data */) {
    return '<div id="spaceChildren"></div>';
  }

  getSpaceChildren() {
    if (this.#spaceChildren) {
      return this.#spaceChildren;
    }
    window.alert(`Erreur de conception : on tente d'accéder à un élément qui n'a pas été défini [spaceChildren]`);
    return document.createElement('div');
  }
  /**
   * Positionne l'espace d'ajout des enfants
   * @param {Element} spaceChildren - Noeud HTML contenant les enfants
   */
  setSpaceChildren(spaceChildren) {
    this.#spaceChildren = spaceChildren;
  }

  /**
   * @override {@link View.refreshView}
   * Cette méthode s'occupe de redessiner la vue tout en conservant l'espace dédié aux enfants et son contenu actuel
   * Si l'espace dédié aux enfants est la racine, alors il n'y a rien à redessiner
   * @param {Object} data - Données à utiliser pour redessiner la vue
   *
   */
  refreshView(data) {
    const nodeElement = createNode(this.getHtmlView(data));
    const spaceChildren = this.determinateSpaceChildren(nodeElement);
    if (nodeElement === spaceChildren) {
      return;
    }
    const oldSpaceChildren = this.getSpaceChildren();
    // Conserver l'espace dédié aux enfants
    spaceChildren.replaceWith(oldSpaceChildren);
    this.getElementView().parentNode.replaceChild(nodeElement, this.getElementView());
    this.setElementView(nodeElement);
  }

  /**
   * Redessine le composant pour afficher les vues des enfants
   * @param {Array<View>} childrenViews - Vues des enfants
   */
  refreshViews(childrenViews) {
    this.removeAllViews();
    for (const view of childrenViews) {
      this.addView(view);
    }
  }

  /**
   * Ajoute un enfant. La vue du composant est ajouté au DOM dans l'espace dédié (id='spaceChildren')
   * @param {View} view : vue
   */
  addView(view) {
    // Ajout au DOM
    this.getSpaceChildren()
      .appendChild(view.getElementView());
    view.added();
  }

  addViewAt(view, index) {
    // Ajout au DOM
    this.getSpaceChildren()
      .insertBefore(view.getElementView(), this.getSpaceChildren().children[index]);
    view.added();
  }

  /**
   * Supprime un enfant. La vue du composant est supprimé du DOM dans l'espace dédié (id='spaceChildren)
   * @param {View} view : vue
   */
  removeView(view) {
    this.getSpaceChildren()
      .removeChild(view.getElementView());
    view.removed();
  }

  /**
   * Remplace un enfant. La vue du composant est remplacée du DOM dans l'espace dédié (id='spaceChildren)
   * @param {View} view : vue
   * @param {View} oldView : vue
   */
  replaceView(view, oldView) {
    this.getSpaceChildren()
      .replaceChild(view.getElementView(), oldView.getElementView());
    oldView.removed();
    view.added();
  }

  removeAllViews() {
    this.getSpaceChildren().innerHTML = '';
    this.getSpaceChildren().array.forEach(view => {
      view.removed();
    });
  }

  /**
   * Détermine et retourne l'espace contenant les enfants (id='spaceChildren')
   * @param {Element} elementView
   * @returns {Element}
   */
  determinateSpaceChildren(elementView) {
    if (elementView.id === 'spaceChildren') {
      return elementView;
    }
    const spaceChildren = elementView
      .querySelector('[id=\'spaceChildren\']');

    if (spaceChildren) {
      return spaceChildren;
    }
    return null;
  }

  isComposite() {
    return true;
  }

}

export default CompositeView;