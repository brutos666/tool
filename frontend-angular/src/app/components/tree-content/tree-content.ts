import { Component, input, model } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { Item } from '../item/item.js';
import { Layout } from '../common/Types.js';
import { ItemData } from '../../data/item-data.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation.js';

@Component({
  imports: [Item],
  selector: 'tree-content',
  styleUrl: './tree-content.scss',
  templateUrl: './tree-content.html',
  hostDirectives: [
    {
      directive: EnterTabNavigation,
      inputs: ['selected', 'selectable'],
      outputs: ['selectedChange'],
    },
  ],
  host: {
    'aria-label': 'Tâche',
  },
})
export class TreeContent {
  treeData = input.required<TreeData<ItemData>>();
  layoutData = input.required<Layout>();
  selectable = input<boolean>(false);
  selected = model<boolean>(false);
}
