import { Directive, input } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';
import { ArrowNavigation } from './arrow-navigation.js';
import { TreeNavigation } from './tree-navigation.js';

@Directive({
  selector: '[tree-list-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: TreeListNavigation },
    { provide: Navigate, useExisting: TreeListNavigation },
  ],
})
export class TreeListNavigation extends ArrowNavigation {
  override name = 'TreeListNavigation';
  override navOrientation = input<'horizontal' | 'vertical'>('vertical');

  override goNext(components: readonly Navigable[], index: number, key: string) {
    const nextIndex = this.getNextIndex(components, index, key);
    if (nextIndex > -1) {
      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
          this.getTreeChildNav(nextIndex)?.setCurrentIndex(0);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          this.getTreeChildNav(nextIndex)?.setCurrentLast();
          break;
        default:
      }
      this.giveFocusIndex(nextIndex);
    }
  }

  override goFirst() {
    // Astuce pour trouver le 1er accessible à partir du début
    const nextIndex = this.getNextIndex(this.navigables, -1, 'Next');
    if (nextIndex === -1) {
      return;
    }
    // IMPORTANT : Désactiver la prise de focus courante. On doit le faire avant les modifications d'index dans l'arbre
    this.navigables[this.getFocusIndex()].changeTabAccess(false);
    const treeNav = this.getTreeChildNav(nextIndex);
    if (treeNav) {
      treeNav.setCurrentIndex(0);
    }
    this.giveFocusIndex(nextIndex);
  }

  override goLast() {
    const components = this.navigables;
    const nbItems = components.length;
    // Astuce pour trouver le dernier accessible à partir de la fin
    const nextIndex = this.getNextIndex(components, nbItems, 'Previous');
    if (nextIndex === -1) {
      return;
    }
    // IMPORTANT : Désactiver la prise de focus courante. On doit le faire avant les modifications d'index dans l'arbre
    components[this.getFocusIndex()].changeTabAccess(false);
    const treeNav = this.getTreeChildNav(nextIndex);
    if (treeNav) {
      treeNav.setCurrentLast();
    }
    this.giveFocusIndex(nextIndex);
  }

  getTreeChildNav(index: number): TreeNavigation | undefined {
    return this.getTreeChildrenNav()[index];
  }
  getTreeChildrenNav(): TreeNavigation[] {
    return this.navigables.filter((navigable) => navigable instanceof TreeNavigation);
  }
}
