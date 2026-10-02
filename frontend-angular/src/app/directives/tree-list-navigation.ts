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

  override moveToIndex(key: string, index: number) {
    // IMPORTANT : Désactiver la prise de focus courante. On doit le faire avant les modifications d'index dans l'arbre
    this.navigables[this.getFocusIndex()].changeTabAccess(false);
    // Modification des index dans l'arbre avant de le rendre courant
    if (['First', 'Next'].includes(key)) {
      this.getTreeChildNav(index)?.setCurrentIndex(0);
    } else {
      this.getTreeChildNav(index)?.setCurrentLast();
    }
    // Prise de focus
    this.giveFocusIndex(index);
  }

  getTreeChildNav(index: number): TreeNavigation | undefined {
    return this.getTreeChildrenNav()[index];
  }
  getTreeChildrenNav(): TreeNavigation[] {
    return this.navigables.map((navigable) => navigable as TreeNavigation);
  }
}
