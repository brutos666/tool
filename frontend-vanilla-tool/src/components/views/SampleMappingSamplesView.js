import ItemsView from './ItemsView.js';

class SampleMappingSamplesView extends ItemsView {

  name = 'SampleMappingSamplesView';

  constructor(data) {
    super(data);
    this.getElementView()
      .querySelector('.items__space')
      .classList.add('sample-mapping__samples-items');
  }

}

export default SampleMappingSamplesView;