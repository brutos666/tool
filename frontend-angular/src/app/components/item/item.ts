import { Component, inject, input, OnInit } from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TextInput } from '../text-input/text-input';
import { ItemService } from '../../services/item-service.js';
import { Toolbar } from '../toolbar/toolbar.js';
import { Button } from '../action-button/button.js';
import { IconButton } from '../action-button/icon-button.js';

@Component({
  imports: [TextInput, Toolbar],
  selector: 'article[item]',
  styleUrl: './item.scss',
  templateUrl: './item.html',
  host: {
    '[class]': 'getClassForCRUDMode(itemData().getCRUDMode())',
  },
})
export class Item implements OnInit {
  private itemService = inject(ItemService);
  private addAction = new IconButton(
    'addNewItem',
    'Ajouter un item',
    'plus',
    this.doAdd.bind(this, 'Nouvel item'),
  );
  private deleteAction = new IconButton(
    'markToDelete',
    'Marquer à supprimer',
    'cross',
    this.markToDelete.bind(this),
  );
  private undoToDeleteAction = new IconButton(
    'undoToDelete',
    'Annuler la suppression',
    'plus',
    this.undoToDelete.bind(this),
  );

  itemData = input.required<ItemData>();
  buttons: Button[] = [this.addAction, this.deleteAction, this.undoToDeleteAction];

  ngOnInit(): void {
    this.undoToDeleteAction.setVisible(false);
  }

  onValueChange(value: string, property: string) {
    const itemData = this.itemData();
    const changedItemData = itemData.clone();
    changedItemData.setValueProperty(property, value);
    this.itemService.updateItem(changedItemData);
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

  doAdd(title: string) {
    const itemData = this.itemData();
    this.itemService.addChildItem(itemData.getId(), new ItemData('', title, '', 'TODO', '', ''));
  }
  markToDelete() {
    const itemData = this.itemData();
    this.itemService.markToDelete(itemData);
  }
  undoToDelete() {
    const itemData = this.itemData();
    this.itemService.undoToDelete(itemData);
  }
}
