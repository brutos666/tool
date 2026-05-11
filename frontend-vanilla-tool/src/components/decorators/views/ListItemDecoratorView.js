import DecoratorView from './DecoratorView.js';

class ListItemDecoratorView extends DecoratorView {

  name = 'ListItemDecoratorView';
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<li class="list__element">${ super.getTemplateDecoratorHTML() }</li>`;
  }

}

export default ListItemDecoratorView;