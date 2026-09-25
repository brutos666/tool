import { Directive, input, model, signal } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';

@Directive({
  selector: '[tab-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: TabNavigation },
    { provide: Navigate, useExisting: TabNavigation },
  ],
  host: {
    '(keydown)': 'enabled() && onKeyDown($event)',
    '(focus)': 'giveFocus()',
    '[attr.index-focus]': 'focusIndex()',
    '[class]': 'enabled() ? "inside" : "outside"',
  },
})
export class TabNavigation implements Navigable, Navigate {
  focusIndex = signal<number>(0);
  private focusableList = signal<readonly Navigable[]>([]);

  // L'accès permet d'entrée dans le composant pour naviguer
  needAccess = input<boolean>(false);
  enabled = model<boolean>(true);

  #selectedIndex = 0;

  constructor() {}

  setFocusableList(focusableList: readonly Navigable[]) {
    this.focusableList.set(focusableList);
    if (focusableList.length) {
      focusableList[this.#selectedIndex].changeTabAccess(this.enabled());
    }
  }

  setFocusIndex(focusIndex: number): void {
    const wasFocused = this.isFocused();
    this.focusIndex.set(focusIndex);
    this.focusComponent(focusIndex);
    if (wasFocused) {
      this.giveFocus();
    }
  }

  changeTabAccess(access: boolean) {
    const components = this.focusableList();
    if (components.length) {
      components[this.#selectedIndex].changeTabAccess(access);
    }
  }
  isFocusable(): boolean {
    const components = this.focusableList();
    if (components.length) {
      return components[this.#selectedIndex].isFocusable();
    }
    return false;
  }

  interceptKeys() {
    const keys = ['Home', 'End', 'Tab'];
    if (this.needAccess()) {
      keys.push(this.enabled() ? 'Escape' : 'Enter');
    }
    return keys;
  }

  onKeyDown(event: KeyboardEvent) {
    const components = this.focusableList();
    const nbItems = components.length;
    if (nbItems === 0) {
      return;
    }
    if (!this.interceptKeys().includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === 'Enter') {
      this.enabled.set(true);
    } else if (event.key === 'Escape') {
      this.enabled.set(false);
    } else if (event.key === 'Home') {
      // Astuce pour trouver le 1er accessible à partir du début
      this.moveToDirection(components, -1, 'Next');
    } else if (event.key === 'End') {
      // Astuce pour trouver le dernier accessible à partir de la fin
      this.moveToDirection(components, nbItems, 'Previous');
    } else if (event.key === 'Tab') {
      this.moveToDirection(components, this.#selectedIndex, event.shiftKey ? 'shift+Tab' : 'Tab');
    } else {
      this.moveToDirection(components, this.#selectedIndex, event.key);
    }
  }

  giveNext(index: number, key: string): number {
    let selectedIndex = index;
    switch (key) {
      case 'Next':
      case 'Tab':
        selectedIndex++;
        break;
      case 'Previous':
      case 'shift+Tab':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }

  moveToDirection(components: readonly Navigable[], index: number, key: string) {
    const nbItems = components.length;
    const selectedIndex = this.giveNext(index, key);
    if (selectedIndex === -1) {
      if (key === 'shift+Tab') {
        // retour à la fin
        this.moveToDirection(components, nbItems, key);
      }
      return;
    }
    if (selectedIndex === nbItems) {
      if (key === 'Tab') {
        // retour au début
        this.moveToDirection(components, -1, key);
      }
      return;
    }
    if (components[selectedIndex].isFocusable()) {
      this.setFocusIndex(selectedIndex);
      this.giveFocus();
    } else {
      this.moveToDirection(components, selectedIndex, key);
    }
  }

  focusComponent(index: number) {
    const components = this.focusableList();
    if (!(index >= 0 && index < components.length)) {
      return;
    }
    if (this.#selectedIndex >= 0 && this.#selectedIndex < components.length) {
      components[this.#selectedIndex].changeTabAccess(false);
    }
    this.#selectedIndex = index;
    components[this.#selectedIndex].changeTabAccess(true);
  }

  giveFocus() {
    const components = this.focusableList();
    components[this.#selectedIndex].giveFocus();
  }

  public isFocused(): boolean {
    const components = this.focusableList();
    return !!components.find((focusable) => focusable.isFocused());
  }
}
