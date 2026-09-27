import { Component, inject, Injector, input, OnInit, TemplateRef } from '@angular/core';
import { Button } from '../action-button/button.js';
import { TreeData } from '../../data/tree-data.js';
import { Data } from '../../data/data.js';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NodeElement } from '../common/NodeElement.js';
import { ArrowNavigation } from '../../directives/arrow-navigation';
import { BasicButton } from '../basic-button/basic-button.js';

@Component({
  imports: [BasicButton, NgTemplateOutlet, NgClass],
  selector: 'tree',
  styleUrl: './tree.scss',
  templateUrl: './tree.html',
  hostDirectives: [ArrowNavigation],
})
export class Tree<T extends Data> extends NodeElement implements OnInit {
  treeInjector = inject(Injector);

  toggleIcon!: Button;
  treeData = input.required<TreeData<T>>();
  contentTemplate = input<TemplateRef<{ content: TreeData<T> }>>();
  isRoot = input<boolean>(false);

  private open: boolean = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.toggleIcon = new Button(
      `toggle${this.treeData().getTreeItemId()}`,
      'Ouvrir/Fermer le noeud',
      'node',
      'button',
      'icon',
    );
  }

  onOpenClose() {
    this.open = !this.open;
    this.setOpen(this.open);
  }

  setOpen(open: boolean) {
    this.open = open;
    const element = this.getElement();
    const tree = element.querySelector('.tree');
    const treeList = element.querySelector('.tree__list');
    if (!treeList || !tree) {
      return;
    }
    tree.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      treeList.classList.remove('hidden');
    } else {
      treeList.classList.add('hidden');
    }
  }
}
