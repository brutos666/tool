import { Component, computed, effect, inject, input, OnInit, ViewChild } from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TextInput } from '../text-input/text-input';
import { ItemService } from '../../services/item-service.js';
import { Toolbar } from '../toolbar/toolbar.js';
import { Button } from '../action-button/button.js';
import { IconButton } from '../action-button/icon-button.js';
import { TreeData } from '../../data/tree-data.js';
import { Layout, Right } from '../common/Types.js';

@Component({
  imports: [TextInput, Toolbar],
  selector: 'article[item]',
  styleUrl: './item.scss',
  templateUrl: './item.html',
  host: {
    '[class]': 'getClassForCRUDMode(crudModeData()) + " " + getClassForLayout(layoutData())',
  },
})
export class Item implements OnInit {
  private itemService = inject(ItemService);

  private addAction!: IconButton;
  private deleteAction!: IconButton;
  private undoToDeleteAction!: IconButton;
  buttonsData: Button[] = [];
  layoutData = input<Layout>(Layout.Title);
  treeData = input.required<TreeData<ItemData>>();
  // Crée un signal computed pour extraire la propriété
  crudModeData = computed(() => this.treeData().getContent().getCRUDMode());
  deletedData = computed(() => this.treeData().getContent().isDeleted());

  @ViewChild('done') doneComponent!: TextInput;
  @ViewChild('title') titleComponent!: TextInput;
  @ViewChild('text') textComponent!: TextInput;

  constructor() {
    // Utilise effect pour réagir aux changements de treeItemId
    effect(() => {
      const isDeleted = this.deletedData();
      this.addAction?.setVisible(!isDeleted);
      this.deleteAction?.setVisible(!isDeleted);
      this.undoToDeleteAction?.setVisible(isDeleted);
      if (isDeleted) {
        this.doneComponent?.setDisabled();
        this.titleComponent?.setDisabled();
        this.textComponent?.setDisabled();
      } else {
        this.doneComponent?.setEnabled();
        this.titleComponent?.setEnabled();
        this.textComponent?.setEnabled();
      }
      // Mise à jour du tableau pour déclencher les mises à jour des vues
      this.buttonsData = [...this.buttonsData];
    });
  }

  ngOnInit(): void {
    const rights = this.getRights(this.layoutData());
    const buttons: IconButton[] = [];
    if (rights.includes(Right.create)) {
      this.addAction = new IconButton(
        'addNewItem',
        'Ajouter un item',
        'plus',
        this.doAdd.bind(this, 'Nouvel item'),
      );
      buttons.push(this.addAction);
    }
    if (rights.includes(Right.delete)) {
      this.deleteAction = new IconButton(
        'markToDelete',
        'Marquer à supprimer',
        'cross',
        this.markToDelete.bind(this),
      );
      this.undoToDeleteAction = new IconButton(
        'undoToDelete',
        'Annuler la suppression',
        'plus',
        this.undoToDelete.bind(this),
      );
      buttons.push(this.deleteAction);
      buttons.push(this.undoToDeleteAction);
    }
    this.buttonsData = buttons;
  }

  onValueChange(value: string, property: string) {
    this.itemService.updateItem(this.treeData(), property, value);
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
