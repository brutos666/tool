import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import Items from './Items.js';
import SampleMappingSamplesView from './views/SampleMappingSamplesView.js';

class SampleMappingSamples extends Items {

  name = 'SampleMappingSamples';
  constructor(treeItem) {
    super(new SampleMappingSamplesView(), treeItem, ITEM_LAYOUT.Sample);
    const buttonAddSample = new AddItemButton({ label: 'Ajouter un exemple', layout: ITEM_LAYOUT.Sample });
    buttonAddSample.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un exemple'));
    this.setStaticChild('addItemAction', buttonAddSample);
  }

}

export default SampleMappingSamples;