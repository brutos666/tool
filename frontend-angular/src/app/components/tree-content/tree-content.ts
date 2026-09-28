import { Component, input, TemplateRef } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { NgTemplateOutlet } from '@angular/common';
import { Data } from '../../data/data.js';
import { EnterNavigation } from '../../directives/enter-navigation.js';

@Component({
  imports: [NgTemplateOutlet],
  selector: 'tree-content',
  styleUrl: './tree-content.scss',
  templateUrl: './tree-content.html',
  hostDirectives: [EnterNavigation],
})
export class TreeContent<T extends Data> {
  treeData = input.required<TreeData<T>>();
  contentTemplate = input<TemplateRef<{ content: TreeData<T> }>>();
}
