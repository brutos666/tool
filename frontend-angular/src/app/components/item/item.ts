import { Component, input } from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TextInput } from '../text-input/text-input';

@Component({
  imports: [TextInput],
  selector: 'article[item]',
  styleUrl: './item.scss',
  templateUrl: './item.html',
})
export class Item {
  itemData = input.required<ItemData>();
}
