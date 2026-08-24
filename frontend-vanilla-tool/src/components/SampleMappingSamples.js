import { ITEM_LAYOUT } from '../tools/Constants.js';
import AddItemButton from './AddItemButton.js';
import DragDropDecorator from './decorators/DragDropDecorator.js';
import ListItemDecorator from './decorators/ListItemDecorator.js';
import DragDropFocusManager from './DragDropFocusManager.js';
import Item from './Item.js';
import Items from './Items.js';
import SampleMappingSamplesView from './views/SampleMappingSamplesView.js';

class SampleMappingSamples extends Items {

  name = 'SampleMappingSamples';

  /** @type {AddItemButton} */
  #addSampleButton;

  constructor(treeItem) {
    super(new SampleMappingSamplesView(), treeItem, ITEM_LAYOUT.Sample);
    this.#addSampleButton = new AddItemButton({ label: 'Ajouter un exemple', layout: ITEM_LAYOUT.Sample });
    this.#addSampleButton.setDoActionCallback(this.addNewItem.bind(this, 'Saisir un exemple'));
    this.setStaticChild('addItemAction', this.#addSampleButton);
    super.getFocusManager()
      .addComponent(this.#addSampleButton);
  }
  /** @override */
  initFocusManager() {
    // NOTE : le système de focus est positionné mais l'écoute des touches de navigation ne doit pas être effective au départ. C'est le composant qui contient les racines des arbres qui doit piloter au départ
    super.setFocusManager(new DragDropFocusManager(this.getElementView(), 'vertical', false));
  }

  /**
   * @override
   */
  getItemComponent(treeItem) {
    const layout = this.getLayout();
    const rights = ITEM_LAYOUT.getRights(layout);
    return new DragDropDecorator(new ListItemDecorator(new Item({ treeItem, layout, rights })));
  }

  /** @override */
  addItemViewAt(itemComponent, index) {
    super.addItemViewAt(itemComponent, index);

    super.getFocusManager()
      .addComponentAt(index, itemComponent.getDecoratedElementByName('ListItemDecorator'));
  }

  /** @override */
  removeItemView(index) {
    // NOTE : avertir le focusManager avant la suppression effective pour donner le focus à un autre élément que si le focus était dans la vue supprimée
    super.getFocusManager()
      .removeComponent(index);

    super.removeItemView(index);
  }

  /** @override */
  removeAllItemsViews() {
    super.getFocusManager()
      .removeAllComponents();
    super.getFocusManager()
      .addComponent(this.#addSampleButton);

    super.removeAllItemsViews();
  }

}

export default SampleMappingSamples;