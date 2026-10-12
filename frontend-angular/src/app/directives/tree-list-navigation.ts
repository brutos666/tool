import { Directive, input } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';
import { TreeNavigation } from './tree-navigation.js';
import { MoveNavigation } from './move-navigation.js';

@Directive({
  selector: '[tree-list-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: TreeListNavigation },
    { provide: Navigate, useExisting: TreeListNavigation },
  ],
  host: {
    '[attr.aria-orientation]': 'navOrientation()',
    'aria-description': "Ctrl+ flèche directionnelle pour aller d'un arbre à l'autre",
  },
})
export class TreeListNavigation extends MoveNavigation {
  override name = 'TreeListNavigation';

  navOrientation = input<'horizontal' | 'vertical'>('vertical');

  override interceptKeys() {
    const keys = [...super.interceptKeys()];
    const orientation = this.navOrientation();
    if (orientation === 'vertical') {
      keys.push('ArrowUp');
      keys.push('ArrowDown');
      keys.push('Ctrl+ArrowUp');
      keys.push('Ctrl+ArrowDown');
    } else {
      keys.push('ArrowLeft');
      keys.push('ArrowRight');
      keys.push('Ctrl+ArrowLeft');
      keys.push('Ctrl+ArrowRight');
    }
    return keys;
  }

  override moveToDirection(key: string): boolean {
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        return super.moveToDirection('Next');
      case 'ArrowLeft':
      case 'ArrowUp':
        return super.moveToDirection('Previous');
      case 'Ctrl+ArrowRight':
      case 'Ctrl+ArrowDown':
        return super.moveToDirection('NextTree');
      case 'Ctrl+ArrowLeft':
      case 'Ctrl+ArrowUp':
        return super.moveToDirection('PreviousTree');
      default:
        return super.moveToDirection(key);
    }
  }
  override giveNext(index: number, direction: string, nbItems: number): number {
    let selectedIndex = index;
    switch (direction) {
      case 'Next':
      case 'NextTree':
        selectedIndex++;
        break;
      case 'Previous':
      case 'PreviousTree':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }

  override moveToIndex(key: string, index: number) {
    // IMPORTANT : Désactiver la prise de focus courante. On doit le faire avant les modifications d'index dans l'arbre
    this.navigables[this.getFocusIndex()].changeTabAccess(false);
    // Modification des index dans l'arbre avant de le rendre courant
    if (['Last', 'Previous'].includes(key)) {
      this.getTreeChildNav(index)?.setCurrentLast();
    } else {
      this.getTreeChildNav(index)?.setCurrentIndex(0);
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
