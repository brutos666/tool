import { Directive } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { KeyboardNavigation } from './keyboard-navigation.js';

@Directive({
  selector: '[move-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: MoveNavigation },
    { provide: Navigate, useExisting: MoveNavigation },
  ],
})
export class MoveNavigation extends KeyboardNavigation {
  override interceptKeys(): String[] {
    return ['Home', 'End'];
  }

  override moveToDirection(key: string): boolean {
    if (key === 'Home') {
      this.goFirst();
    } else if (key === 'End') {
      this.goLast();
    } else {
      const nextIndex = this.getNextIndex(this.navigables, this.getFocusIndex(), key);
      if (nextIndex > -1) {
        this.moveToIndex(key, nextIndex);
        return true;
      }
      return false;
    }
    return true;
  }

  moveToIndex(key: string, index: number) {
    this.giveFocusIndex(index);
  }

  getNextIndex(components: readonly Navigable[], index: number, key: string): number {
    const nbItems = components.length;
    const selectedIndex = this.giveNext(index, key, nbItems);
    if (selectedIndex === -1 || selectedIndex === nbItems) {
      return -1;
    }
    if (components[selectedIndex].isFocusable()) {
      return selectedIndex;
    }
    return this.getNextIndex(components, selectedIndex, key);
  }

  giveNext(index: number, direction: string, nbItems: number): number {
    let selectedIndex = index;
    switch (direction) {
      case 'Next':
        selectedIndex++;
        break;
      case 'Previous':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }

  goFirst() {
    // Astuce pour trouver le 1er accessible à partir du début
    const nextIndex = this.getNextIndex(this.navigables, -1, 'Next');
    if (nextIndex > -1) {
      this.moveToIndex('First', nextIndex);
    }
  }
  goLast() {
    const components = this.navigables;
    const nbItems = components.length;
    // Astuce pour trouver le dernier accessible à partir de la fin
    const nextIndex = this.getNextIndex(components, nbItems, 'Previous');
    if (nextIndex > -1) {
      this.moveToIndex('Last', nextIndex);
    }
  }
}
