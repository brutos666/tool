import { Component, input, TemplateRef } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { Data } from '../../data/data.js';
import { Tree } from '../tree/tree.js';

@Component({
  imports: [Tree],
  selector: 'tree-list',
  styleUrl: './tree-list.scss',
  templateUrl: './tree-list.html',
  host: {
    'aria-orientation': 'vertical',
    role: 'group',
  },
})
export class TreeList<T extends Data> {
  dataList = input.required<Array<TreeData<T>>>();
  contentTemplate = input<TemplateRef<{ content: T }>>();
}
