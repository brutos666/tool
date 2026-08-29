import StoreData from '../../data/StoreData.js';
import { ITEM_LAYOUT } from '../../tools/Constants.js';
import DragButton from '../DragButton.js';
import ItemDecorator from './ItemDecorator.js';
import DragDropDecoratorView from './views/DragDropDecoratorView.js';
/** @import Item from '../Item.js'; */
/** @import Tree from './Tree.js'; */

class DragDropDecorator extends ItemDecorator {

  name = 'DragDropDecorator';

  static EVENTS = {
    dragStart: 'dragStart',
    dragEnd: 'dragEnd',
    dragOverTree: 'dragOverTree',
    dragDrop: 'dragDrop',
  };

  #treeItemId;
  #overComponent;

  constructor(decoratedElement) {
    super(new DragDropDecoratorView(decoratedElement.getView()), decoratedElement);
    /** @type {Item} */
    const item = this.getDecoratedElementByName('Item');
    const listItem = this.getDecoratedElementByName('ListItemDecorator');
    this.#overComponent = listItem ? listItem : item;
    const footerToolbar = this.#overComponent.getStaticChild('footerToolbar');

    const isPostIt = ITEM_LAYOUT.isPostIt(item.getLayout());
    const dragAction = new DragButton(decoratedElement, isPostIt ? 'move' : 'reorder');
    dragAction.setDoActionCallback(this.startDragDrop.bind(this, 'keyboard'));
    if (footerToolbar) {
      footerToolbar.addChild(dragAction);
    }

    /** @type {DragDropDecoratorView} */
    const view = this.getView();
    view.addEventListener(DragDropDecorator.EVENTS.dragStart, () => {
      this.startDragDrop('mouse');
    });
    view.addEventListener(DragDropDecorator.EVENTS.dragEnd, () => {
      this.stopDragDrop();
    });
    view.addEventListener(DragDropDecorator.EVENTS.dragOverTree, () => {
      /** @type {Tree} */
      const tree = this.getDecoratedElementByName('Tree');
      tree.openNode();
    });
    view.addEventListener(DragDropDecorator.EVENTS.dragDrop, event => {
      const position = event.detail;
      this.dropOver(position);

      // Donner le focus par là
      const parentFocusManager = this.getFocusManager()
        .getParentFocusManager();
      parentFocusManager.setCurrent(decoratedElement);
      parentFocusManager.giveFocus();
    });

    const treeItem = item.getTreeItem();
    this.setTreeItem(treeItem);
  }

  setTreeItem(treeItem) {
    super.setTreeItem(treeItem);
    this.getView()
      .setTreeItemId(treeItem.getTreeItemId());
    this.#treeItemId = treeItem.getTreeItemId();
  }

  /**
   * Début du dragDrop
   * @param {'keyboard'|'mouse'} dragDropType - Clavier ou souris
   */
  startDragDrop(dragDropType) {
    const focusManager = this.#overComponent.getFocusManager();
    const parentFocusManager = focusManager.giveControlToParent();
    parentFocusManager.giveFocus();

    const dragDropCenter = StoreData.getDragDropCenter();
    dragDropCenter.enterDragDropMode(dragDropType, this.#treeItemId);
  }
  stopDragDrop() {
    const dragDropCenter = StoreData.getDragDropCenter();
    dragDropCenter.exitDragDropMode();
  }
  dropOver(position) {
    const dragDropCenter = StoreData.getDragDropCenter();
    dragDropCenter.dropOverComponent(this.#treeItemId, position);

    // TODO : donner le contrôle au focusManager dans lequel se trouve le composant relâché
  }

  /** @override */
  enterDragDropMode(dragDropType, draggedId) {
    super.enterDragDropMode(dragDropType, draggedId);

    this.getView()
      .authorizeDrop(isDropAuthorized(draggedId, this.#treeItemId));
  }
  /** @override */
  exitDragDropMode(dragDropType) {
    super.exitDragDropMode(dragDropType);

    this.getView()
      .authorizeDrop(true);
  }

}
/**
 * Vérifie si le drop est autorisé
 * @param {string} draggedId : Identifiant de l'élément déplacé
 * @param {string} dragDropId : Identifiant de l'élément sur lequel on veut relâcher l'élément
 * @returns {boolean} true si le drop est autorisé
 */
function isDropAuthorized(draggedId, dragDropId) {
  return draggedId !== dragDropId && !StoreData.getTreeItem()
    .isChildOf(dragDropId, draggedId);
}

export default DragDropDecorator;