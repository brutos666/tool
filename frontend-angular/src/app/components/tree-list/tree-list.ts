import { Component, input, TemplateRef } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { Data } from '../../data/data.js';
import { Tree } from '../tree/tree.js';
import { Composite } from '../common/Composite.js';
import { TreeNavigation } from '../../directives/tree-navigation.js';

@Component({
  imports: [Tree],
  selector: 'tree-list',
  styleUrl: './tree-list.scss',
  templateUrl: './tree-list.html',
  hostDirectives: [{ directive: TreeNavigation, inputs: ['navOrientation'] }],
  host: {
    'aria-orientation': 'vertical',
    role: 'group',
  },
})
export class TreeList<T extends Data> extends Composite {
  name = 'TreeList';

  dataList = input.required<Array<TreeData<T>>>();
  contentTemplate = input<TemplateRef<{ content: TreeData<T> }>>();
}
