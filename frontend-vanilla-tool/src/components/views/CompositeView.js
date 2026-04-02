import View from './View.js';
import { createNode } from '../../tools/NodeUtilities.js';

class CompositeView extends View {

  /** @type {Element} */
  #spaceChildren;

  constructor(data) {
    super(data);
    this.#spaceChildren = this.determinateSpaceChildren(this.getNodeView());
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
      .appendChild(view.getNodeView());
  }

  /**
   * Supprime un enfant. La vue du composant est supprimé du DOM dans l'espace dédié (id='spaceChildren)
   * @param {View} view : vue
   */
  removeView(view) {
    this.getSpaceChildren()
      .removeChild(view.getNodeView());
  }

  /**
   * Remplace un enfant. La vue du composant est remplacée du DOM dans l'espace dédié (id='spaceChildren)
   * @param {View} view : vue
   * @param {View} oldView : vue
   */
  replaceView(view, oldView) {
    this.getSpaceChildren()
      .replaceChild(view.getNodeView(), oldView.getNodeView());
  }

  removeAllViews() {
    this.getSpaceChildren().innerHTML = '';
  }

  /**
   * Détermine et retourne l'espace contenant les enfants (id='spaceChildren')
   * @param {Element} nodeView
   * @returns {Element}
   */
  determinateSpaceChildren(nodeView) {
    if (nodeView.id === 'spaceChildren') {
      return nodeView;
    }
    const spaceChildren = nodeView
      .querySelector('[id=\'spaceChildren\']');

    if (spaceChildren) {
      return spaceChildren;
    }
    return null;
  }

}

export default CompositeView;