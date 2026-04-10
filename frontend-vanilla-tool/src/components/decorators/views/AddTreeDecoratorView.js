import DecoratorView from './DecoratorView.js';

class AddTreeDecoratorView extends DecoratorView {

  constructor(view) {
    super(view);
  }
  getHtmlView() {
    return String.raw`<div class="add-tree--decorator"><template></template><template id="toolbar"></template></div>`;
  }

}

export default AddTreeDecoratorView;