import StoreData from '../../data/StoreData.js';
import { ITEM_LAYOUT } from '../../tools/Constants.js';
import DragButton from '../DragButton.js';
import ItemDecorator from './ItemDecorator.js';
import DragDropDecoratorView from './views/DragDropDecoratorView.js';
/** @import Item from '../Item.js'; */

class DragDropDecorator extends ItemDecorator {

  name = 'DragDropDecorator';

  static EVENTS = {
    dragOver: 'dragOver',
    dragDrop: 'dragDrop',
    dragEnd: 'dragEnd',
    dragOn: 'dragOn', // Lorsque le déplacement d'un élément commence
    dragOff: 'dragOff', // Lorsque le déplacement d'un élément se termine
  };

  #treeItemId;
  #item;

  constructor(decoratedElement) {
    super(new DragDropDecoratorView(decoratedElement.getView()), decoratedElement);
    /** @type {Item} */
    this.#item = this.getDecoratedElementByName('Item');
    const listItem = this.getDecoratedElementByName('ListItemDecorator');
    const itemLayout = this.#item.getLayout();
    const isPostIt = ITEM_LAYOUT.isPostIt(itemLayout);
    const footerToolbar = listItem ? listItem.getStaticChild('footerToolbar') : this.#item.getStaticChild('footerToolbar');
    const treeItem = this.#item.getTreeItem();

    const dragAction = new DragButton(decoratedElement, isPostIt ? 'move' : 'reorder');
    dragAction.setDoActionCallback(this.startDragDrop.bind(this));
    if (footerToolbar) {
      footerToolbar.addChild(dragAction);
    }

    /** @type {DragDropDecoratorView} */
    const view = this.getView();
    view.addEventListener(DragDropDecorator.EVENTS.dragOver, event => {
      const position = event.detail;
      if (position === 'before') {
        this.addOverBefore();
      } else if (position === 'after') {
        this.addOverAfter();
      } else if (position === 'inside') {
        this.addOverInside();
      } else if (position === 'outside') {
        this.removeOver();
      }
    });
    view.addEventListener(DragDropDecorator.EVENTS.dragDrop, () => {
      const draggedId = StoreData.getDragDropCenter()
        .getDraggedId();

      this.dropOver(draggedId);
    });
    view.addEventListener(DragDropDecorator.EVENTS.dragOn, event => {
      const draggedId = event.detail;
      const dragDropId = this.#treeItemId;
      this.getView()
        .authorizeDrop(isDropAuthorized(draggedId, dragDropId));
    });
    view.addEventListener(DragDropDecorator.EVENTS.dragOff, () => {
      this.getView()
        .authorizeDrop(true);
    });

    this.setTreeItem(treeItem);
  }

  setTreeItem(treeItem) {
    super.setTreeItem(treeItem);
    this.getView()
      .setTreeItemId(treeItem.getTreeItemId());
    this.#treeItemId = treeItem.getTreeItemId();
  }

  /**
   * Début du dragDrop soit par le clavier
   */
  startDragDrop() {
    const focusManager = this.getFocusManager();
    const parentFocusManager = focusManager.giveControlToParent();
    parentFocusManager.enterDragDropMode(this.#treeItemId);
  }

  dropOver(draggedId) {
    this.getView()
      .dropOver(draggedId);
  }
  addOverInside() {
    this.getView()
      .addOverInside();
  }

  addOverBefore() {
    this.getView()
      .addOverBefore();
  }

  addOverAfter() {
    this.getView()
      .addOverAfter();
  }

  removeOver() {
    this.getView()
      .removeOver();
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