import Items from './Items.js';
import SampleMappingSamplesView from './views/SampleMappingSamplesView.js';

class SampleMappingSamples extends Items {

  name = 'SampleMappingSamples';
  constructor(treeItemList, itemLayout) {
    super(new SampleMappingSamplesView(), treeItemList, itemLayout);
    // TODO : ajouter un bouton permettant d'ajouter un sample
  }

}

export default SampleMappingSamples;