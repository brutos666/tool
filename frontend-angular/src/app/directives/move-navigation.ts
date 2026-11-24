import { Directive } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { KeyboardNavigation } from './keyboard-navigation.js';
import { WithPositionedTooltip } from '../components/common/WithPositionedTooltip.js';

@Directive({
  selector: '[move-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: MoveNavigation },
    { provide: Navigate, useExisting: MoveNavigation },
    { provide: WithPositionedTooltip, useExisting: MoveNavigation },
  ],
  host: {
    '[aria-selected]': 'selectable() ? selected() : null',
    '[aria-description]': 'selectable() ? "Barre d\'espace pour sélectionner" : null',
  },
})
export class MoveNavigation extends KeyboardNavigation {
  override onMouseDown(event: MouseEvent) {
    if (this.selectable()) {
      this.selected.set(true);
    }
    super.onMouseDown(event);
  }

  override interceptKeys(): String[] {
    if (this.selectable()) {
      return [' ', 'Home', 'End'];
    }
    return ['Home', 'End'];
  }

  override moveToDirection(key: string): boolean {
    switch (key) {
      case 'Home':
        this.goFirst();
        break;
      case 'End':
        this.goLast();
        break;
      case ' ':
        this.selected.set(true);
        break;
      default:
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
