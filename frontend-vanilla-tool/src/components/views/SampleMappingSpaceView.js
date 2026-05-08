import View from './View.js';

class SampleMappingSpaceView extends View {

  name = 'SampleMappingSpaceView';
  getHtmlView() {
    return String.raw`<div class ="sample-mapping">
      <template id="toolbar" class="sample-mapping__toolbar"></template>
      <template id="sampleMappingTable" class="sample-mapping__table"></template>
    </div>`;
  }

}
export default SampleMappingSpaceView;