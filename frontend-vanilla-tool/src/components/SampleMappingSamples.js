import ActionButton from './ActionButton.js';
import Items from './Items.js';
import SampleMappingSamplesView from './views/SampleMappingSamplesView.js';

class SampleMappingSamples extends Items {

  name = 'SampleMappingSamples';
  constructor(treeItem, itemLayout) {
    super(new SampleMappingSamplesView(), treeItem, itemLayout);
    const buttonAddSample = new ActionButton({ label: 'Add Sample' });
    buttonAddSample.setDoActionCallback(this.addNewItem.bind(this, 'Nouvelle exemple'));
    this.setStaticChild('addItemAction', buttonAddSample);
  }

}

export default SampleMappingSamples;