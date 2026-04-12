import View from './View.js';

class SampleMappingView extends View {

  name = 'SampleMappingView';
  constructor(view) {
    super(view);
  }

  getHtmlView() {
    return String.raw`<div class="sample-mapping">
    <section class="sample-mapping__content">
      <div class="sample-mapping__table"><template id="table"></template></div>
    </section>
    </div>`;
  }

}

export default SampleMappingView;