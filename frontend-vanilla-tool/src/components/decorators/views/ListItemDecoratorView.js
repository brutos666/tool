import DecoratorView from './DecoratorView.js';

class ListItemDecoratorView extends DecoratorView {

  name = 'ListItemDecoratorView';
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<li class="list__item">${ super.getTemplateDecoratorHTML() }
    <footer class="list__item__footer"><template id="footerToolbar" aria-controls="itemArticle" class="list__item__footer-toolbar" ></template></footer>
    </li>`;
  }

}

export default ListItemDecoratorView;