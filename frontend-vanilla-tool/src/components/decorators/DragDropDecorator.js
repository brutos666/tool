import StoreData from '../../data/StoreData.js';
import { ITEM_LAYOUT } from '../../tools/Constants.js';
import DragButton from '../DragButton.js';
import ItemDecorator from './ItemDecorator.js';
import DragDropDecoratorView from './views/DragDropDecoratorView.js';
/** @import Item from '../Item.js'; */
/** @import Tree from './Tree.js'; */
/** @import DragDropFocusManager from '../DragDropFocusManager.js'; */

class DragDropDecorator extends ItemDecorator {

  name = 'DragDropDecorator';

  static EVENTS = {
    dragStart: 'dragStart',
    dragEnd: 'dragEnd',
    dragOverTree: 'dragOverTree',
    dragDrop: 'dragDrop',
  };
  #onDragStartEvent = this.startDragDrop.bind(this, 'mouse');
  #onDragEndEvent = this.stopDragDrop.bind(this);
  #onDragOverTreeEvent = this.openTreeNode.bind(this);
  #onDragDropEvent = this.dragDrop.bind(this);

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
    view.addEventListener(DragDropDecorator.EVENTS.dragStart, this.#onDragStartEvent);
    view.addEventListener(DragDropDecorator.EVENTS.dragEnd, this.#onDragEndEvent);
    view.addEventListener(DragDropDecorator.EVENTS.dragOverTree, this.#onDragOverTreeEvent);
    view.addEventListener(DragDropDecorator.EVENTS.dragDrop, this.#onDragDropEvent);

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
  }
  openTreeNode() {
    /** @type {Tree} */
    const tree = this.getDecoratedElementByName('Tree');
    tree.openNode();
  }
  dragDrop(event) {
    const position = event.detail;
    /** @type {DragDropFocusManager} */
    const parentFocusManager = this.getFocusManager()
      .getParentFocusManager();
    parentFocusManager.dropComponent(position, this.#treeItemId);
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

  /** @override */
  destroy() {
    const view = this.getView();
    view.removeEventListener(DragDropDecorator.EVENTS.dragStart, this.#onDragStartEvent);
    view.removeEventListener(DragDropDecorator.EVENTS.dragEnd, this.#onDragEndEvent);
    view.removeEventListener(DragDropDecorator.EVENTS.dragOverTree, this.#onDragOverTreeEvent);
    view.removeEventListener(DragDropDecorator.EVENTS.dragDrop, this.#onDragDropEvent);

    super.destroy();

    this.#onDragDropEvent = null;
    this.#onDragEndEvent = null;
    this.#onDragOverTreeEvent = null;
    this.#onDragStartEvent = null;
    this.#overComponent = null;
    this.#treeItemId = null;
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