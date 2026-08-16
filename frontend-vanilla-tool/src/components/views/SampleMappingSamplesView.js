import ItemsView from './ItemsView.js';

class SampleMappingSamplesView extends ItemsView {

  name = 'SampleMappingSamplesView';

  constructor() {
    super();
    this.getElementView()
      .classList.add('sample-mapping__samples-items');
  }

  getHtmlView() {
    return String.raw`<div class="sample-mapping__samples">
    <ol id="itemsSpace" class="sample-mapping__samples-items items__space" role="tree" aria-orientation="vertical"></ol>
    <footer class="sample-mapping__samples__footer"><template id="addItemAction"></template></footer>
    </div>`;
  }

}

export default SampleMappingSamplesView;