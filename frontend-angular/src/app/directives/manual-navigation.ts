import { afterNextRender, Directive, ElementRef, inject, signal } from '@angular/core';
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
  override name = 'BasicNavigation';

  elementRef = inject(ElementRef);

  navigables: Navigable[] = [];
  needSort = signal<boolean>(false);

  #selectedIndex = 0;
  #access: boolean = false;
  #focused: boolean = false;

  constructor() {
    super();
    afterNextRender({
      // Note : après toutes les modifications appliquées au DOM suite des changements (signal, événement)
      read: () => {
        this.sortNavigables();
      },
    });
  }

  startNavigation() {}
  stopNavigation() {}

  getFocusIndex(): number {
    return this.#selectedIndex;
  }

  registerChild(navigable: Navigable) {
    this.navigables.push(navigable);
    const nbNav = this.navigables.length;
    if (nbNav === 1) {
      this.reloadNavigation();
    }
  }
  unregisterChild(navigable: Navigable) {
    const indexToRemove = this.navigables.indexOf(navigable);
    this.navigables.splice(indexToRemove, 1);
    if (this.#selectedIndex < indexToRemove) {
      return;
    }
    const nbLeft = this.navigables.length;
    if (nbLeft === 0) {
      this.#selectedIndex = 0;
      return;
    }
    const index =
      this.#selectedIndex > indexToRemove || indexToRemove === nbLeft
        ? this.#selectedIndex - 1
        : this.#selectedIndex;
    this.#selectedIndex = index;
    this.reloadNavigation();
  }

  reloadNavigation() {
    const component = this.navigables[this.#selectedIndex];
    if (!component) {
      return;
    }
    if (this.#access) {
      component.changeTabAccess(true);
    }
    if (this.#focused) {
      component.giveFocus();
    }
  }

  sortNavigables() {
    if (this.navigables.length <= 1) {
      return;
    }
    this.navigables.sort((a, b) => {
      const pos = a.getElement().compareDocumentPosition(b.getElement());
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos & Node.DOCUMENT_POSITION_CONTAINS) {
        // Si b suit a alors -1 indique que a est avant b
        return -1;
      }
      return 1;
    });
  }

  onMouseDown(event: MouseEvent) {
    // Trouver l'arbre cliqué
    if (!event.target) {
      return;
    }
    if (event.target instanceof HTMLElement) {
      const index = this.getNavigableIndex(event.target);
      if (index > -1) {
        this.changeCurrentIndex(index);
      }
    }
  }

  getNavigableIndex(element: HTMLElement): number {
    return this.navigables.findIndex((navigable) => navigable.getElement().contains(element));
  }

  giveFocusIndex(focusIndex: number): void {
    this.focusComponent(focusIndex);
    this.giveFocus();
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
    if (this.#selectedIndex === index) {
      return;
    }
    const components = this.navigables;
    if (!(index >= 0 && index < components.length)) {
      return;
    }
    components[this.#selectedIndex].changeTabAccess(false);
    this.#selectedIndex = index;
  }
  setCurrentIndex(index: number) {
    this.#selectedIndex = index;
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
    this.#access = access;
    this.#focused = false;
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
    this.#focused = true;
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].giveFocus();
    }
  }

  override isFocused(): boolean {
    const components = this.navigables;
    return !!components.find((focusable) => focusable.isFocused());
  }
}
