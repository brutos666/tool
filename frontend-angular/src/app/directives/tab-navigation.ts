import { Directive } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { BasicNavigation } from './basic-navigation.js';

@Directive({
  selector: '[tab-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: TabNavigation },
    { provide: Navigate, useExisting: TabNavigation },
  ],
})
export class TabNavigation extends BasicNavigation {
  override name = 'TabNavigation';

  override interceptKeys(): String[] {
    return [...super.interceptKeys(), 'Tab'];
  }

  override giveNext(index: number, key: string, nbItems: number): number {
    let selectedIndex = index;
    switch (key) {
      case 'Tab':
        if (selectedIndex === nbItems - 1) {
          return 0;
        }
        selectedIndex++;
        break;
      case 'shift+Tab':
        if (selectedIndex === 0) {
          return nbItems - 1;
        }
        selectedIndex--;
        break;
      default:
        return super.giveNext(index, key, nbItems);
    }
    return selectedIndex;
  }
}
