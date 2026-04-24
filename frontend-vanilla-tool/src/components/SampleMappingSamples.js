import { ITEM_LAYOUT } from '../tools/Constants.js';
import ActionButton from './ActionButton.js';
import Items from './Items.js';
import SampleMappingSamplesView from './views/SampleMappingSamplesView.js';

class SampleMappingSamples extends Items {

  name = 'SampleMappingSamples';
  constructor(treeItem) {
    super(new SampleMappingSamplesView(), treeItem, ITEM_LAYOUT.Sample);
    const buttonAddSample = new ActionButton({ label: 'Ajouter un exemple', role: 'button' });
    buttonAddSample.setDoActionCallback(this.addNewItem.bind(this, 'Nouvelle exemple'));
    this.setStaticChild('addItemAction', buttonAddSample);
  }

}

export default SampleMappingSamples;