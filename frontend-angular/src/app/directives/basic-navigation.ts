import { afterNextRender, Directive, ElementRef, inject, signal } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { Focusable } from './focusable.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[basic-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: BasicNavigation },
    { provide: Navigate, useExisting: BasicNavigation },
  ],
  host: {
    '[attr.index-focus]': 'focusIndex()',
  },
})
export class BasicNavigation extends Focusable implements Navigate {
  override name = 'BasicNavigation';

  elementRef = inject(ElementRef);

  focusIndex = signal<number>(0);
  navigables: Navigable[] = [];
  needSort = signal<boolean>(false);

  #selectedIndex = 0;

  constructor() {
    super();
    afterNextRender({
      read: () => {
        this.sortNavigables();
      },
    });
  }

  setEnable(enable: boolean): void {}
  startNavigation() {}
  stopNavigation() {}

  registerChild(navigable: Navigable) {
    this.navigables.push(navigable);
  }
  unregisterChild(navigable: Navigable) {
    this.navigables.splice(this.navigables.indexOf(navigable), 1);
  }

  sortNavigables() {
    if (this.navigables.length <= 1) {
      return;
    }
    this.navigables.sort((a, b) => {
      const pos = a.getElement().compareDocumentPosition(b.getElement());
      if (pos & Node.DOCUMENT_POSITION_DISCONNECTED) {
        return 0;
      }
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos & Node.DOCUMENT_POSITION_CONTAINS) {
        // Si b suit a alors -1 indique que a est avant b
        return -1;
      }
      if (pos & Node.DOCUMENT_POSITION_PRECEDING || pos & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return 1;
      }

      return 0;
    });
  }

  giveFocusIndex(focusIndex: number): void {
    this.focusComponent(focusIndex);
    this.giveFocus();
    this.focusIndex.set(focusIndex);
  }

  setFocusIndex(index: number): void {
    const wasFocused = this.isFocused();
    if (wasFocused) {
      this.giveFocusIndex(index);
      return;
    }
    const components = this.navigables;
    if (!(index >= 0 && index < components.length)) {
      return;
    }
    components[this.#selectedIndex].changeTabAccess(false);
    this.#selectedIndex = index;
    this.focusIndex.set(index);
  }

  focusComponent(index: number) {
    const components = this.navigables;
    if (!(index >= 0 && index < components.length)) {
      return;
    }
    components[this.#selectedIndex].changeTabAccess(false);
    components[index].changeTabAccess(true);
    this.#selectedIndex = index;
  }

  override changeTabAccess(access: boolean) {
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].changeTabAccess(access);
    }
  }

  override isFocusable(): boolean {
    const components = this.navigables;
    if (components.length) {
      return components[this.#selectedIndex].isFocusable();
    }
    return false;
  }

  override giveFocus() {
    const components = this.navigables;
    components[this.#selectedIndex].giveFocus();
  }

  override isFocused(): boolean {
    const components = this.navigables;
    return !!components.find((focusable) => focusable.isFocused());
  }
}
