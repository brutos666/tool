import { Component, effect, inject, input, model, OnInit, ViewChild } from '@angular/core';
import { Button } from '../action-button/button.js';
import { TreeData } from '../../data/tree-data.js';
import { NodeElement } from '../common/NodeElement.js';
import { NoFocusableButton } from '../action-button/no-focusable-button.js';
import { TreeContent } from '../tree-content/tree-content';
import { TreeNavigation } from '../../directives/tree-navigation.js';
import { ItemData } from '../../data/item-data.js';
import { Layout } from '../common/Types.js';
import { ItemService } from '../../services/item-service.js';

@Component({
  imports: [NoFocusableButton, TreeContent],
  selector: 'tree',
  styleUrl: './tree.scss',
  templateUrl: './tree.html',
  hostDirectives: [TreeNavigation],
  host: {
    '[attr.item-id]': 'treeData().getItemId()',
    '[attr.tree-item-id]': 'treeData().getTreeItemId()',
    '[class]':
      "{'tree--node':treeData().getChildren().length, 'tree--leaf':treeData().getChildren().length === 0, 'tree--root':isRoot() }",
    role: 'treeitem',
    'aria-label': 'Arbre',
  },
})
export class Tree extends NodeElement implements OnInit {
  treeNavigation = inject(TreeNavigation);
  itemService = inject(ItemService);

  toggleIcon!: Button;
  treeData = input.required<TreeData<ItemData>>();
  layoutData = input.required<Layout>();
  isRoot = input<boolean>(false);
  selectable = input<boolean>(false);

  @ViewChild('toggle') toggleComponent!: NoFocusableButton;

  constructor() {
    super();
    effect(() => this.doOpenClose(this.treeNavigation.openState()));
  }

  ngOnInit(): void {
    this.toggleIcon = new Button(
      `toggle${this.treeData().getTreeItemId()}`,
      'Ouvrir/Fermer le noeud',
      "Ouvre ou ferme le noeud de l'arbre des tâches",
      'node',
      this.onOpenClose.bind(this),
    );
    // Pour les TODO liste, on ouvre directement tous les arbres pour un niveau
    if (this.isRoot() && this.layoutData() === Layout.Todo) {
      this.onOpenClose();
    }
  }

  onOpenClose() {
    this.treeNavigation.changeOpenState(!this.treeNavigation.openState());
  }

  doOpenClose(open: boolean) {
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
    this.toggleComponent?.rotate90(open);
  }
}
