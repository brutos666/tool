import { Component, computed, effect, inject, input, OnInit, ViewChild } from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TextInput } from '../text-input/text-input';
import { ItemService } from '../../services/item-service.js';
import { Toolbar } from '../toolbar/toolbar.js';
import { Button } from '../action-button/button.js';
import { IconButton } from '../action-button/icon-button.js';
import { TreeData } from '../../data/tree-data.js';
import { Layout, Right } from '../common/Types.js';
import { NodeElement } from '../common/NodeElement.js';
import { CheckBox } from '../check-box/check-box.js';

@Component({
  imports: [TextInput, Toolbar, CheckBox],
  selector: 'item',
  styleUrl: './item.scss',
  templateUrl: './item.html',
})
export class Item extends NodeElement {
  name = 'Item';

  private itemService = inject(ItemService);

  private addAction!: IconButton;
  private deleteAction!: IconButton;
  private undoToDeleteAction!: IconButton;
  buttonsData: Button[] = [];
  layoutData = input.required<Layout>();
  treeData = input.required<TreeData<ItemData>>();
  // Crée un signal computed pour extraire la propriété
  itemData = computed(() => this.treeData().getContent());
  itemForm = computed(() => this.itemData().getItemForm());
  itemId = computed(() => this.itemForm().id);
  deleted = computed(() => this.itemForm().deleted());
  indeterminateState = false;

  crudModeData = computed(() => this.itemData().getCRUDMode());

  @ViewChild('done') doneComponent!: TextInput;
  @ViewChild('title') titleComponent!: TextInput;
  @ViewChild('text') textComponent!: TextInput;

  constructor() {
    super();
    effect(() => {
      const itemId = this.itemId();
      const deleted = this.deleted();
      const rights = this.getRights(this.layoutData());
      const buttons: IconButton[] = [];
      if (rights.includes(Right.create)) {
        if (this.addAction == null) {
          this.addAction = new IconButton(
            `${itemId}-add`,
            'Ajouter un item',
            'plus',
            this.doAdd.bind(this, 'Nouvel item'),
          );
        }
        buttons.push(this.addAction);
      }
      if (rights.includes(Right.delete)) {
        if (this.deleteAction == null) {
          this.deleteAction = new IconButton(
            `${itemId}-delete`,
            'Marquer à supprimer',
            'cross',
            this.markToDelete.bind(this),
          );
          this.undoToDeleteAction = new IconButton(
            `${itemId}-undo-delete`,
            'Annuler la suppression',
            'plus',
            this.undoToDelete.bind(this),
          );
        }
        buttons.push(this.deleteAction);
        buttons.push(this.undoToDeleteAction);
      }
      this.addAction?.setVisible(!deleted);
      this.deleteAction?.setVisible(!deleted);
      this.undoToDeleteAction?.setVisible(deleted);
      this.buttonsData = buttons;
    });
  }

  doAdd(title: string) {
    const treeData = this.treeData();
    this.itemService.addChildItem(treeData, title);
  }
  markToDelete() {
    const treeData = this.treeData();
    this.itemService.markToDelete(treeData);
  }
  undoToDelete() {
    const treeData = this.treeData();
    this.itemService.undoToDelete(treeData);
  }

  isPostIt(layout: Layout) {
    return [Layout.Story, Layout.Rules, Layout.Sample, Layout.Question].includes(layout);
  }
  hasDone(layout: Layout) {
    return this.isPostIt(layout) || [Layout.Todo].includes(layout);
  }
  hasText(layout: Layout) {
    return this.isPostIt(layout);
  }
  hasFooterToolbar(layout: Layout) {
    return layout === Layout.Title || layout === Layout.Todo;
  }
  getRights(layout: Layout): Right[] {
    if (this.isPostIt(layout)) {
      if (layout === Layout.Story) {
        return [Right.update];
      }
      return [Right.update, Right.delete];
    }
    return [Right.create, Right.update, Right.delete];
  }

  /**
   * Retourne la classe CSS correspondant au statut
   * @param {'CREATE'|'UPDATE'|'DELETE'|'READ'} mode - Mode CRUD de l'item
   * @returns {string} - classe CSS à appliquer
   */
  getClassForCRUDMode(mode: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ'): string {
    switch (mode) {
      case 'CREATE':
        return 'item--crud-created';
      case 'UPDATE':
        return 'item--crud-updated';
      case 'DELETE':
        return 'item--crud-deleted';
      case 'READ':
        return 'item--crud-read';
      default:
        return '';
    }
  }
  getClassForLayout(layout: Layout) {
    if (this.isPostIt(layout)) {
      return 'item--post-it';
    }
    switch (layout) {
      case Layout.Todo:
        return 'item--todo';
      case Layout.Title:
        return 'item--title';
      default:
        return 'item--block';
    }
  }
}
