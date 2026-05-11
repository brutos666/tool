import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import ListItemDecorator from './decorators/ListItemDecorator.js';
import Item from './Item.js';
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

  /**
   * @override
   */
  getItemComponent(treeItem) {
    const layout = this.getLayout();
    const rights = ITEM_LAYOUT.getRights(layout);
    return new DragDropDecorator(new ListItemDecorator(new Item({ treeItem, layout, rights })));
  }

}

export default SampleMappingSamples;