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
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ManualNavigation extends Focusable implements Navigate {
  override name = 'ManualNavigation';

  elementRef = inject(ElementRef);

  navigables: Navigable[] = [];
  needSort: boolean = false;
  // Il s'agit juste d'un boolean qui va indiquer que quelque chose a changé
  toggleForReload = signal<boolean>(false);

  #selectedIndex = 0;

  constructor() {
    super();
    afterRenderEffect({
      // Déclencher à la mise à jour d'un signal après mise à jour du DOM
      // Comme on veut modifier des attributs html tabindex, on le fait sur la phase write
      write: () => {
        this.toggleForReload();
        if (!this.needSort) {
          return;
        }
        this.sortNavigables(this.navigables);
        this.needSort = false;
        this.applyTabAccess();
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
    this.mustGiveFocus = this.containFocus;
    this.navigables = this.navigables.concat(navigable);
    this.needSort = true;
    this.forceReload();
  }

  unregisterChild(navigable: Navigable) {
    const indexToRemove = this.navigables.indexOf(navigable);
    if (indexToRemove === -1) {
      return;
    }
    if (this.#selectedIndex === indexToRemove) {
      this.mustGiveFocus = this.containFocus;
    }
    this.#selectedIndex = this.getIndexAfterRemove(indexToRemove);
    this.navigables = this.navigables.filter((component) => component !== navigable);
    this.needSort = true;
    this.forceReload();
  }
  private forceReload() {
    this.toggleForReload.set(!this.toggleForReload());
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

  onFocusOut(event: FocusEvent) {
    if (!event.relatedTarget || !(event.relatedTarget instanceof Element)) {
      return;
    }
    if (!this.getElement().contains(event.relatedTarget)) {
      this.removeFocus();
    }
  }

  onMouseDown(event: MouseEvent) {
    if (!event.target || !(event.target instanceof Element)) {
      return;
    }
    // Exclure les boutons notamment l'ouverture des noeuds
    if (event.target.closest('button')) {
      event.stopPropagation();
      return;
    }
    const index = this.getNavigableIndex(event.target);
    if (index > -1) {
      this.containFocus = true;
      this.changeCurrentIndex(index);
    } else {
      this.giveFocusIndex(this.getNavigableWithElement(event.target));
      event.preventDefault();
    }
  }
  private getNavigableIndex(element: Element): number {
    return this.navigables.findIndex((navigable) => navigable.getElement().contains(element));
  }
  private getNavigableWithElement(element: Element): number {
    return this.navigables.findIndex((navigable) => element.contains(navigable.getElement()));
  }

  /** Modifie l'élément courant, le rend accessible via la touche Tab et lui donne le focus */
  giveFocusIndex(index: number): void {
    this.changeCurrentIndex(index);
    if (index >= 0 && index < this.navigables.length) {
      this.navigables[index].changeTabAccess(true);
      this.giveFocus();
    }
  }
  /** Modifie l'élément courant sans perdre le focus */
  setFocusIndex(index: number): void {
    const wasFocused = this.isFocused();
    if (wasFocused) {
      this.giveFocusIndex(index);
    } else {
      this.changeCurrentIndex(index);
    }
  }
  /** Désactive l'élément accessible via la touche Tab et modifie l'élément courant (sans donner le focus) */
  changeCurrentIndex(index: number): void {
    if (this.#selectedIndex !== index) {
      this.navigables[this.#selectedIndex]?.changeTabAccess(false);
      this.setCurrentIndex(index);
    }
  }
  /** Positionne l'élément courant */
  setCurrentIndex(index: number) {
    this.#selectedIndex = index;
  }

  /** Rend l'élément courant accessible via la touche Tab */
  override applyTabAccess() {
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].changeTabAccess(this.accessible);
    }
  }

  override isFocusable(): boolean {
    const components = this.navigables;
    if (components.length) {
      return components[this.#selectedIndex].isFocusable();
    }
    return false;
  }

  /** Donne le focus */
  override giveFocus() {
    this.containFocus = true;
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].giveFocus();
    }
  }

  override isFocused(): boolean {
    const components = this.navigables;
    return !!components.find((focusable) => focusable.isFocused());
  }

  private getIndexAfterRemove(indexToRemove: number): number {
    const nbLeft = this.navigables.length - 1;
    if (nbLeft === 0) {
      return 0;
    }
    return this.#selectedIndex > indexToRemove || this.#selectedIndex === nbLeft
      ? this.#selectedIndex - 1
      : this.#selectedIndex;
  }
}
