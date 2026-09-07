import { AfterViewInit, Component, input, InputSignal, TemplateRef } from '@angular/core';
import { Button } from '../action-button/button.js';
import { NodeElement } from '../common/NodeElement.js';
import { ActionButton } from '../action-button/action-button.js';
import { TreeData } from '../../data/tree-data.js';
import { Data } from '../../data/data.js';
import { NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
  imports: [ActionButton, NgTemplateOutlet, NgClass],
  selector: 'tree',
  styleUrl: './tree.scss',
  templateUrl: './tree.html',
})
export class Tree<T extends Data> extends NodeElement {
  toggleIcon!: Button;
  treeData = input.required<TreeData<T>>();
  contentTemplate = input<TemplateRef<{ content: T }>>();
  isRoot = input<boolean>(false);

  private open: boolean = false;

  constructor() {
    super();
    this.toggleIcon = new Button('Ouvrir/Fermer le noeud', 'node', 'button', 'icon');
  }

  onOpenClose() {
    this.open = !this.open;
    this.setOpen(this.open);
  }

  setOpen(open: boolean) {
    this.open = open;
    const element = this.getElement();
    const treeList = element.querySelector('.tree__list');
    if (!treeList) {
      return;
    }
    element.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      treeList.classList.remove('hidden');
    } else {
      treeList.classList.add('hidden');
    }
  }
}
