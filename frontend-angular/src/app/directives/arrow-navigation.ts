import { Directive, input } from '@angular/core';
import { Focusable } from './focusable.js';
import { TabNavigation } from './tab-navigation.js';

@Directive({
  selector: '[arrow-navigation-directive]',
  host: {
    '[attr.aria-orientation]': 'orientation()',
  },
})
export class ArrowNavigation extends TabNavigation {
  orientation = input<'horizontal' | 'vertical'>('horizontal');

  override interceptKeys() {
    const keys = ['Home', 'End'];
    const orientation = this.orientation();
    if (orientation === 'vertical') {
      keys.push('ArrowUp');
      keys.push('ArrowDown');
    } else {
      keys.push('ArrowLeft');
      keys.push('ArrowRight');
    }
    return keys;
  }

  override giveNext(components: readonly Focusable[], index: number, key: string): number {
    let selectedIndex = index;
    const nbItems = components.length;
    switch (key) {
      case 'Home':
        return 0;
      case 'End':
        return nbItems - 1;
      case 'ArrowRight':
      case 'ArrowDown':
        selectedIndex++;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }
}
