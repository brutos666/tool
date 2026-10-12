import { Directive } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { MoveNavigation } from './move-navigation.js';

@Directive({
  selector: '[tab-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: TabNavigation },
    { provide: Navigate, useExisting: TabNavigation },
  ],
})
export class TabNavigation extends MoveNavigation {
  override name = 'TabNavigation';

  override interceptKeys(): String[] {
    return [...super.interceptKeys(), 'Tab', 'Shift+Tab'];
  }

  override moveToDirection(key: string): boolean {
    switch (key) {
      case 'Tab':
        return super.moveToDirection('Next');
      case 'Shift+Tab':
        return super.moveToDirection('Previous');
      default:
        return super.moveToDirection(key);
    }
  }

  override giveNext(index: number, direction: string, nbItems: number): number {
    // Contrairement à la navigation avec les flèches, la navigation avec les tabulation revient au départ
    if (direction === 'Next' && index === nbItems - 1) {
      return 0;
    }
    if (direction === 'Previous' && index === 0) {
      return nbItems - 1;
    }
    return super.giveNext(index, direction, nbItems);
  }
}
