import DecoratorView from './DecoratorView.js';

class MenuElementView extends DecoratorView {

  name = 'MenuElementView';
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<li class="menu__element list__element">${ super.getTemplateDecoratorHTML() }</li>`;
  }

}

export default MenuElementView;