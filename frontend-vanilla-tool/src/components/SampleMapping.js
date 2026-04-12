import TreeItem from '../data/TreeItem.js';
import { ITEM_LAYOUT } from '../tools/Constants.js';
import Component from './Component.js';
import SampleMappingTables from './SampleMappingTables.js';
import SampleMappingView from './views/SampleMappingView.js';

class SampleMapping extends Component {

  name = 'SampleMapping';

  #table;

  constructor() {
    super(new SampleMappingView());

    this.#table = new SampleMappingTables(new TreeItem({ title: 'Sample Mapping', children: [] }), ITEM_LAYOUT.Rules);
    this.setStaticChild('table', this.#table);
  }
  /**
   * Positionne les données à afficher
   * @param {TreeItem} treeItem - Informations sur la tache
   */
  setTreeItem(treeItem) {
    this.#table.setTreeItem(treeItem);
  }

}

export default SampleMapping;