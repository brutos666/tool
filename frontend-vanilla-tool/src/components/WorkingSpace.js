import Composite from './Composite.js';
import TodoListLayout from './TodoListLayout.js';
import TreeLayout from './TreeLayout.js';
import WorkingSpaceView from './views/WorkingSpaceView.js';

class WorkingSpace extends Composite {

  #treeLayout;
  #todoListLayout;

  constructor() {
    super(new WorkingSpaceView());

    this.#treeLayout = new TreeLayout();
    this.#todoListLayout = new TodoListLayout();
    this.setStaticChild('treeLayout', this.#treeLayout);
    this.setStaticChild('panelLayout', this.#todoListLayout);

    this.#treeLayout.loadItems();
    this.#todoListLayout.loadItems();
  }

}

export default WorkingSpace;