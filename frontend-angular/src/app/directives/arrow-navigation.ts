import { Directive, input } from '@angular/core';
import { TabNavigation } from './tab-navigation.js';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[arrow-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: ArrowNavigation },
    { provide: Navigate, useExisting: ArrowNavigation },
  ],
  host: {
    '[attr.aria-orientation]': 'navOrientation()',
  },
})
export class ArrowNavigation extends TabNavigation {
  override name = 'ArrowNavigation';

  navOrientation = input<'horizontal' | 'vertical'>('horizontal');

  override interceptKeys() {
    const keys = ['Home', 'End'];
    const orientation = this.navOrientation();
    if (orientation === 'vertical') {
      keys.push('ArrowUp');
      keys.push('ArrowDown');
    } else {
      keys.push('ArrowLeft');
      keys.push('ArrowRight');
    }
    return keys;
  }

  override giveNext(index: number, key: string, nbItems: number): number {
    let selectedIndex = index;
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        selectedIndex++;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        selectedIndex--;
        break;
      default:
        super.giveNext(index, key, nbItems);
        break;
    }
    return selectedIndex;
  }
}
