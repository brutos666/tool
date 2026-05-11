import ItemsView from './ItemsView.js';

class SampleMappingSamplesView extends ItemsView {

  name = 'SampleMappingSamplesView';

  constructor() {
    super({ addButton: true });
    this.getElementView()
      .classList.add('sample-mapping__samples-items');
  }

  addChildView() {
    super.addChildView();
    this.getElementView()
      .classList.add('sample-mapping__samples-items');
  }

}

export default SampleMappingSamplesView;