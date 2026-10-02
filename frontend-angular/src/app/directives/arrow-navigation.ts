import { Directive, input } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';
import { MoveNavigation } from './move-navigation.js';

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
export class ArrowNavigation extends MoveNavigation {
  override name = 'ArrowNavigation';

  navOrientation = input<'horizontal' | 'vertical'>('horizontal');

  override interceptKeys() {
    const keys = [...super.interceptKeys()];
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
  override moveToDirection(key: string): boolean {
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        return super.moveToDirection('Next');
      case 'ArrowUp':
      case 'ArrowLeft':
        return super.moveToDirection('Previous');
      default:
        return super.moveToDirection(key);
    }
  }
}
