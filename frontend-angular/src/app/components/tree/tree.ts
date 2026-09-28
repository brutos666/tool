import {
  AfterViewInit,
  Component,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { Button } from '../action-button/button.js';
import { TreeData } from '../../data/tree-data.js';
import { Data } from '../../data/data.js';
import { NgClass } from '@angular/common';
import { NodeElement } from '../common/NodeElement.js';
import { BasicButton } from '../basic-button/basic-button.js';
import { TreeContent } from '../tree-content/tree-content';
import { TreeNavigation } from '../../directives/tree-navigation.js';

@Component({
  imports: [BasicButton, NgClass, TreeContent],
  selector: 'tree',
  styleUrl: './tree.scss',
  templateUrl: './tree.html',
  hostDirectives: [TreeNavigation],
})
export class Tree<T extends Data> extends NodeElement implements OnInit, AfterViewInit {
  treeInjector = inject(Injector);
  treeNavigation = inject(TreeNavigation);

  toggleIcon!: Button;
  treeData = input.required<TreeData<T>>();
  contentTemplate = input<TemplateRef<{ content: TreeData<T> }>>();
  isRoot = input<boolean>(false);

  constructor() {
    super();
    effect(() => this.doOpenClose(this.treeNavigation.openState()));
  }
  ngAfterViewInit(): void {
    this.treeNavigation.changeOpenState(false);
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
    this.treeNavigation.changeOpenState(!this.treeNavigation.openState());
  }

  doOpenClose(open: boolean) {
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
