import { Directive, model, signal, untracked } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[manual-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: ManualNavigation },
    { provide: Navigate, useExisting: ManualNavigation },
  ],
  host: {
    '(focus)': 'giveFocus()',
    '[attr.index-focus]': 'focusIndex()',
    '[class]': 'enabled() ? "inside" : "outside"',
  },
})
export class ManualNavigation implements Navigable, Navigate {
  focusIndex = signal<number>(0);
  focusableList = signal<readonly Navigable[]>([]);
  enabled = model<boolean>(true);

  #selectedIndex = 0;

  setFocusableList(focusableList: readonly Navigable[]) {
    this.focusableList.set(focusableList);
    this.changeTabAccess(this.enabled());
  }

  setFocusIndex(focusIndex: number): void {
    const wasFocused = this.isFocused();
    this.focusComponent(focusIndex);
    if (wasFocused) {
      this.giveFocus();
    }
    this.focusIndex.set(focusIndex);
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

  focusComponent(index: number) {
    const components = this.focusableList();
    if (!(index >= 0 && index < components.length)) {
      return;
    }
    components[this.#selectedIndex].changeTabAccess(false);
    components[index].changeTabAccess(true);
    this.#selectedIndex = index;
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
