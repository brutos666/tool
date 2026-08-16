import ActionButton from './ActionButton.js';
import CheckBox from './CheckBox.js';
import Component from './Component.js';
import SampleMapping from './SampleMapping.js';
import Toolbar from './Toolbar.js';
import SampleMappingSpaceView from './views/SampleMappingSpaceView.js';

class SampleMappingSpace extends Component {

  name = 'SampleMappingSpace';

  #sampleMapping;

  constructor(treeItem) {
    super(new SampleMappingSpaceView());
    this.#sampleMapping = new SampleMapping(treeItem);

    const zoomMinus = new ActionButton({ id: 'zoomMinus', label: 'Zoom -', role: 'button', type: 'label' });
    zoomMinus.setDoActionCallback(this.#sampleMapping.zoomMinus.bind(this.#sampleMapping));
    const zoomPlus = new ActionButton({ id: 'zoomPlus', label: 'Zoom +', role: 'button', type: 'label' });
    zoomPlus.setDoActionCallback(this.#sampleMapping.zoomPlus.bind(this.#sampleMapping));
    const reset = new ActionButton({ id: 'zoomReset', label: 'Zoom initial', role: 'button', type: 'label' });
    reset.setDoActionCallback(this.#sampleMapping.zoomReset.bind(this.#sampleMapping));
    const magnify = new CheckBox({ id: 'magnify', label: 'Activer le zoom sur le post-it courant', role: 'switch', type: 'toggle' });
    magnify.setToggleCallback(this.#sampleMapping.magnifyFocused.bind(this.#sampleMapping));

    const toolbar = new Toolbar();
    toolbar.addChild(zoomMinus);
    toolbar.addChild(zoomPlus);
    toolbar.addChild(reset);
    toolbar.addChild(magnify);
    this.setStaticChild('toolbar', toolbar);
    // Active de la navigation au clavier. L'accès à la barre d'outils se fait directement par la tabulation
    toolbar.getFocusManager()
      .enableKeyNavigation();

    this.setStaticChild('sampleMappingTable', this.#sampleMapping);
  }

  setTreeItem(treeItem) {
    this.#sampleMapping.setTreeItem(treeItem);
  }

}

export default SampleMappingSpace;