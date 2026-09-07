import { Component, input } from '@angular/core';
import { ItemData } from '../../data/item-data.js';

@Component({
  imports: [],
  selector: 'article[item]',
  styleUrl: './item.scss',
  templateUrl: './item.html',
})
export class Item {
  itemData = input.required<ItemData>();
}
