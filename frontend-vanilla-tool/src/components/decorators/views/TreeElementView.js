import DecoratorView from './DecoratorView.js';

class TreeElementView extends DecoratorView {

  name = 'TreeElementView';
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<li class="tree__element">${ super.getTemplateDecoratorHTML() }</li>`;
  }

}

export default TreeElementView;