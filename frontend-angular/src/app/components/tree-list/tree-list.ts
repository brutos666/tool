import { Component, inject, input } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { Tree } from '../tree/tree.js';
import { TreeListNavigation } from '../../directives/tree-list-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { ItemData } from '../../data/item-data.js';
import { Layout } from '../common/Types.js';
import { NotificationService } from '../../services/notification-service.js';
import { ItemService } from '../../services/item-service.js';

@Component({
  imports: [Tree],
  selector: 'tree-list',
  styleUrl: './tree-list.scss',
  templateUrl: './tree-list.html',
  hostDirectives: [{ directive: TreeListNavigation, inputs: ['navOrientation: orientation'] }],
  host: {
    '[attr.aria-orientation]': 'orientation()',
    role: 'group',
    'aria-label': 'Arbres',
  },
})
export class TreeList extends NodeElement {
  name = 'TreeList';

  itemService = inject(ItemService);

  dataList = input.required<Array<TreeData<ItemData>>>();
  layoutData = input.required<Layout>();
  emptyMessage = input<string>(NotificationService.NO_CHILD);
  orientation = input<'horizontal' | 'vertical'>('vertical');
  canBeSelected = input<boolean>(false);
}
