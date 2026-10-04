import { computed, Directive, effect, ElementRef, inject, input, OnDestroy } from '@angular/core';
import { ItemService } from '../services/item-service.js';
import { ItemData } from '../data/item-data.js';
import { TreeData } from '../data/tree-data.js';
import { Layout } from '../components/common/Types.js';

@Directive({
  selector: '[select-tree-directive]',
  host: {
    '[aria-selected]': 'isCurrent()',
    'aria-description': "Barre d'espace pour sélectionner l'arbre",
  },
})
export class SelectTree implements OnDestroy {
  name = 'SelectTree';

  treeData = input.required<TreeData<ItemData>>();
  layoutData = input.required<Layout>();

  private itemService = inject(ItemService);
  private elementRef = inject(ElementRef);

  isCurrent = computed(() => this.itemService.isCurrentItem(this.treeData()));

  #onClickEvent = this.onClick.bind(this);
  #onKeyDownEvent = this.onKeyDown.bind(this);

  constructor() {
    effect(() => {
      if (this.layoutData() === Layout.Title) {
        this.elementRef.nativeElement.addEventListener('click', this.#onClickEvent);
        this.elementRef.nativeElement.addEventListener('keydown', this.#onKeyDownEvent);
      }
    });
  }
  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('click', this.#onClickEvent);
    this.elementRef.nativeElement.removeEventListener('keydown', this.#onKeyDownEvent);
  }

  onClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) {
      return;
    }
    const closestTree = event.target.closest('[tree-item-id]');
    if (closestTree?.getAttribute('tree-item-id') !== this.treeData().getTreeItemId()) {
      return;
    }
    if (!event.target.closest('button')) {
      this.itemService.setCurrentItem(this.treeData());
    }
    event.preventDefault();
    event.stopPropagation();
  }

  onKeyDown(event: KeyboardEvent) {
    if (![' '].includes(event.key) || this.isCurrent()) {
      return;
    }
    this.itemService.setCurrentItem(this.treeData());
    event.preventDefault();
    event.stopPropagation();
  }
}
