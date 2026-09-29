import { Directive, ElementRef, inject, signal } from '@angular/core';
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

  #selectedIndex = 0;

  setEnable(enable: boolean): void {}
  startNavigation() {}
  stopNavigation() {}

  registerChild(navigable: Navigable) {
    this.navigables.push(navigable);
  }

  setFocusIndex(focusIndex: number): void {
    const wasFocused = this.isFocused();
    this.focusComponent(focusIndex);
    if (wasFocused) {
      this.giveFocus();
    }
    this.focusIndex.set(focusIndex);
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
