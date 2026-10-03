import { afterRenderEffect, Directive, ElementRef, inject, signal } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { Focusable } from './focusable.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[basic-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: ManualNavigation },
    { provide: Navigate, useExisting: ManualNavigation },
  ],
  host: {
    '[attr.index-focus]': 'getFocusIndex()',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class ManualNavigation extends Focusable implements Navigate {
  override name = 'ManualNavigation';

  elementRef = inject(ElementRef);

  navigables: Navigable[] = [];
  navigablesSignal = signal<Navigable[]>([]);

  #selectedIndex = 0;

  constructor() {
    super();
    afterRenderEffect({
      // Déclencher à la mise à jour d'un signal après mise à jour du DOM
      // Comme on veut modifier des attributs html tabindex, on le fait sur la phase write
      write: () => {
        this.navigables = this.sortNavigables([...this.navigablesSignal()]);
        this.changeTabAccess(this.accessible);
        if (this.mustGiveFocus) {
          this.giveFocus();
          this.mustGiveFocus = false;
        }
      },
    });
  }

  startNavigation() {}
  stopNavigation() {}

  getFocusIndex(): number {
    return this.#selectedIndex;
  }

  registerChild(navigable: Navigable) {
    this.navigablesSignal.update((navigables) => navigables.concat(navigable));
  }
  unregisterChild(navigable: Navigable) {
    this.#selectedIndex = this.getIndexAfterRemove(navigable);
    this.navigablesSignal.update((navigables) =>
      navigables.filter((component) => component !== navigable),
    );
  }

  private sortNavigables(navigables: Navigable[]) {
    if (navigables.length <= 1) {
      return navigables;
    }
    return navigables.sort((a, b) => {
      const pos = a.getElement().compareDocumentPosition(b.getElement());
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos & Node.DOCUMENT_POSITION_CONTAINS) {
        // Si b suit a alors -1 indique que a est avant b
        return -1;
      }
      return 1;
    });
  }

  onMouseDown(event: MouseEvent) {
    if (!event.target || !(event.target instanceof Element)) {
      return;
    }
    const index = this.getNavigableIndex(event.target);
    if (index > -1) {
      this.changeCurrentIndex(index);
    }
  }

  private getNavigableIndex(element: Element): number {
    return this.navigables.findIndex((navigable) => navigable.getElement().contains(element));
  }

  giveFocusIndex(index: number): void {
    this.changeCurrentIndex(index);
    if (index >= 0 && index < this.navigables.length) {
      this.navigables[index].changeTabAccess(true);
      this.giveFocus();
    }
  }

  setFocusIndex(index: number): void {
    const wasFocused = this.isFocused();
    if (wasFocused) {
      this.giveFocusIndex(index);
    } else {
      this.changeCurrentIndex(index);
    }
  }
  changeCurrentIndex(index: number): void {
    if (this.#selectedIndex !== index) {
      this.navigables[this.#selectedIndex]?.changeTabAccess(false);
      this.setCurrentIndex(index);
    }
  }
  setCurrentIndex(index: number) {
    this.#selectedIndex = index;
  }

  override changeTabAccess(access: boolean) {
    if (!access) {
      this.mustGiveFocus = false;
    }
    this.accessible = access;
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
    this.mustGiveFocus = true;
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].giveFocus();
    }
  }

  override isFocused(): boolean {
    const components = this.navigables;
    return !!components.find((focusable) => focusable.isFocused());
  }

  private getIndexAfterRemove(navigable: Navigable): number {
    const indexToRemove = this.navigables.indexOf(navigable);
    const nbLeft = this.navigables.length - 1;
    if (nbLeft === 0) {
      return 0;
    }
    return this.#selectedIndex > indexToRemove || this.#selectedIndex === nbLeft
      ? this.#selectedIndex - 1
      : this.#selectedIndex;
  }
}
