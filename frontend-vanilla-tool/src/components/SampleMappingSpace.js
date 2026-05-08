import ActionButton from './ActionButton.js';
import CheckBox from './CheckBox.js';
import Component from './Component.js';
import ManagerItemsDecorator from './decorators/ManagerItemsDecorator.js';
import SampleMapping from './SampleMapping.js';
import Toolbar from './Toolbar.js';
import SampleMappingSpaceView from './views/SampleMappingSpaceView.js';

class SampleMappingSpace extends Component {

  name = 'SampleMappingSpace';

  #sampleMappingTable;
  constructor(treeItem) {
    super(new SampleMappingSpaceView());
    this.#sampleMappingTable = new SampleMapping(treeItem);

    const zoomMinus = new ActionButton({ id: 'zoomMinus', label: 'Zoom -', role: 'button', type: 'label' });
    zoomMinus.setDoActionCallback(this.#sampleMappingTable.zoomMinus.bind(this.#sampleMappingTable));
    const zoomPlus = new ActionButton({ id: 'zoomPlus', label: 'Zoom +', role: 'button', type: 'label' });
    zoomPlus.setDoActionCallback(this.#sampleMappingTable.zoomPlus.bind(this.#sampleMappingTable));
    const reset = new ActionButton({ id: 'zoomReset', label: 'Zoom initial', role: 'button', type: 'label' });
    reset.setDoActionCallback(this.#sampleMappingTable.zoomReset.bind(this.#sampleMappingTable));
    const magnify = new CheckBox({ id: 'magnify', label: 'Activer le zoom sur le post-it courant', role: 'switch', type: 'toggle' });
    magnify.setToggleCallback(this.#sampleMappingTable.magnifyFocused.bind(this.#sampleMappingTable));
    const toolbar = new Toolbar();
    toolbar.addChild(zoomMinus);
    toolbar.addChild(zoomPlus);
    toolbar.addChild(reset);
    toolbar.addChild(magnify);

    this.setStaticChild('toolbar', toolbar);
    this.setStaticChild('sampleMappingTable', new ManagerItemsDecorator(this.#sampleMappingTable));
  }

  setTreeItem(treeItem) {
    this.#sampleMappingTable.setTreeItem(treeItem);
  }

}

export default SampleMappingSpace;