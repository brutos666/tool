import ItemsView from './ItemsView.js';

class SampleMappingSamplesView extends ItemsView {

  name = 'SampleMappingSamplesView';

  constructor() {
    super({ addButton: true });
    this.getElementView()
      .querySelector('.items__space')
      .classList.add('sample-mapping__samples-items');
  }

}

export default SampleMappingSamplesView;