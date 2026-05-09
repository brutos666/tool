import DecoratorView from './DecoratorView.js';

/**
 * Cette classe permet juste d'ajouter une classe et des attributs au composant qu'elle décore sans décorer l'affichage.
 * Cela permet de savoir quel comportement a été ajouté au composant en regardant dans le DOM
 */
class ClassDecoratorView extends DecoratorView {

  name = 'ClassDecoratorView';
  constructor(decoratedView, decoratorClass) {
    super(decoratedView);
    decoratedView.getElementView().classList.add(decoratorClass);
  }
  getHtmlView() {
    return String.raw`<template id="decoratedSpace" class="class--decorator"></template>`;
  }

  setDecoratorSpace(view) {
    this.setElementView(view.getElementView());
  }

}

export default ClassDecoratorView;