import {
  AfterViewInit,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { Focusable } from './focusable.js';

@Directive({
  selector: '[tab-navigation-directive]',
  host: {
    '(keydown)': 'onKeyDown($event)',
    '[attr.index-focus]': 'focusIndex()',
  },
})
export class TabNavigation implements AfterViewInit {
  private elementRef = inject(ElementRef);

  focusIndex = input<number>(0);
  focusableListQry = contentChildren(Focusable, { descendants: true });

  #selectedIndex = -1;

  constructor() {}

  ngAfterViewInit(): void {
    const components = this.focusableListQry();
    if (!components.length) {
      return;
    }
    components.forEach((component) => component.changeTabAccess(false));
    this.#selectedIndex = 0;
    components[this.#selectedIndex].changeTabAccess(true);
  }

  interceptKeys() {
    return ['Home', 'End', 'Tab'];
  }

  onKeyDown(event: KeyboardEvent) {
    const components = this.focusableListQry();
    const nbItems = components.length;
    if (nbItems === 0) {
      return;
    }
    if (!this.interceptKeys().includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === 'Tab') {
      this.moveToDirection(components, this.#selectedIndex, event.shiftKey ? 'shift+Tab' : 'Tab');
    } else {
      this.moveToDirection(components, this.#selectedIndex, event.key);
    }
  }

  giveNext(components: readonly Focusable[], index: number, key: string): number {
    let selectedIndex = index;
    const nbItems = components.length;
    switch (key) {
      case 'Home':
        return 0;
      case 'End':
        return nbItems - 1;
      case 'Tab':
        selectedIndex++;
        break;
      case 'shift+Tab':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }

  moveToDirection(components: readonly Focusable[], index: number, key: string) {
    const nbItems = components.length;
    const selectedIndex = this.giveNext(components, index, key);
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
      this.focusComponent(selectedIndex);
    } else {
      this.moveToDirection(components, selectedIndex, key);
    }
  }

  focusComponent(index: number) {
    const components = this.focusableListQry();
    if (this.#selectedIndex >= 0 && this.#selectedIndex < components.length) {
      components[this.#selectedIndex].changeTabAccess(false);
    }
    if (index >= 0 && index < components.length) {
      this.#selectedIndex = index;
      components[this.#selectedIndex].giveFocus();
    }
  }

  getElementToFocus(): HTMLElement {
    const components = this.focusableListQry();
    if (this.#selectedIndex < components.length) {
      return components[this.#selectedIndex].getElementToFocus();
    }
    return this.elementRef.nativeElement;
  }

  giveFocus() {
    const components = this.focusableListQry();
    if (this.#selectedIndex < components.length) {
      components[this.#selectedIndex].giveFocus();
    }
  }

  public isFocused(): boolean {
    const components = this.focusableListQry();
    return !!components.find((focusable) => focusable.isFocused());
  }
}
