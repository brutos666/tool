import { Component, inject, input } from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TextInput } from '../text-input/text-input';
import { ItemService } from '../../services/item-service.js';

@Component({
  imports: [TextInput],
  selector: 'article[item]',
  styleUrl: './item.scss',
  templateUrl: './item.html',
  host: {
    '[class]': 'getClassForCRUDMode(itemData().getCRUDMode())',
  },
})
export class Item {
  private itemService = inject(ItemService);

  itemData = input.required<ItemData>();

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
}
