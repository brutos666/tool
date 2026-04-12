import CompositeView from './CompositeView.js';

class SampleMappingSamplesView extends CompositeView {

  name = 'SampleMappingSamplesView';
  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="sample-mapping__samples-items"></div>`;
  }

}

export default SampleMappingSamplesView;