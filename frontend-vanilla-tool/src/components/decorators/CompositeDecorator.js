import Decorator from './Decorator.js';
/** @import Composite from '../Composite.js' */
/** @import DecoratorView from './views/DecoratorView.js' */
/** @import CompositeView from '../views/CompositeView.js' */

/**
 * Cette classe s'occupe de décorer l'affichage d'un composant avec enfants.
 * Le but est que le composant conserve son arborescence mais que l'affichage des enfants soit décorés
 */
class CompositeDecorator extends Decorator {

  /**
   * @constructor
   * @param {DecoratorView} decoratorView
   * @param {Composite} decoratedElement
   */
  constructor(decoratorView, decoratedElement) {
    super(decoratorView, decoratedElement);
  }

  svgCode(decoratedElement) {
    decoratedElement.getView().addView = view => {
      this.addView(view);
    };
    decoratedElement.getView().removeView = view => {
      this.removeView(view);
    };
    decoratedElement.getView().replaceView = (view, oldView) => {
      this.replaceView(view, oldView);
    };
    decoratedElement.getView().refreshView = data => {
      this.refreshView(data);
    };
    decoratedElement.getView().refreshViews = childrenViews => {
      this.refreshViews(childrenViews);
    };
    decoratedElement.getView().removeAllViews = () => {
      this.removeAllViews();
    };
  }

  /**
   * Positionne l'espace d'ajout des enfants
   * @param {Element} spaceChildren - Noeud HTML contenant les enfants
   */
  setSpaceChildren(spaceChildren) {
    this.getOriginalElement()
      .getView()
      .setSpaceChildren(spaceChildren);
  }

}

export default CompositeDecorator;