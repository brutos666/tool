import { Component, input } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { Tree } from '../tree/tree.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { ItemData } from '../../data/item-data.js';
import { Layout } from '../common/Types.js';

@Component({
  imports: [Tree],
  selector: 'tree-list',
  styleUrl: './tree-list.scss',
  templateUrl: './tree-list.html',
  hostDirectives: [{ directive: ArrowNavigation, inputs: ['navOrientation'] }],
  host: {
    'aria-orientation': 'vertical',
    role: 'group',
  },
})
export class TreeList extends NodeElement {
  name = 'TreeList';

  dataList = input.required<Array<TreeData<ItemData>>>();
  layoutData = input.required<Layout>();
}
