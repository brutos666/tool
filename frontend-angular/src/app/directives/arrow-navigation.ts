import {
  AfterContentInit,
  computed,
  contentChildren,
  Directive,
  effect,
  input,
} from '@angular/core';
import { Focusable } from './focusable.js';

@Directive({
  selector: '[arrow-navigation-directive]',
  host: {
    '[attr.aria-orientation]': 'orientation()',
    '(keydown)': 'onKeyDown($event)',
    '[attr.index-focus]': 'focusIndex()',
  },
})
export class ArrowNavigation implements AfterContentInit {
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  focusIndex = input<number>(0);
  focusableListQry = contentChildren(Focusable, { descendants: true });

  #selectedIndex = -1;

  constructor() {
    effect(() => {
      this.focusComponent(this.focusIndex());
    });
  }

  ngAfterContentInit(): void {
    const components = this.focusableListQry();
    if (!components.length) {
      return;
    }
    this.#selectedIndex = 0;
    components[this.#selectedIndex].changeTabAccess(true);
  }

  interceptKeys() {
    const keys = ['Home', 'End'];
    const orientation = this.orientation();
    if (orientation === 'vertical') {
      keys.push('ArrowUp');
      keys.push('ArrowDown');
    } else {
      keys.push('ArrowLeft');
      keys.push('ArrowRight');
    }
    return keys;
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

    let selectedIndex = this.#selectedIndex;
    switch (event.key) {
      case 'Home':
        selectedIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        selectedIndex = nbItems - 1;
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        selectedIndex++;
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        selectedIndex--;
        event.preventDefault();
        break;
    }

    if (selectedIndex === -1 || selectedIndex === nbItems) {
      return;
    }
    this.focusComponent(selectedIndex);
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

  giveFocus() {
    const components = this.focusableListQry();
    if (this.#selectedIndex < components.length) {
      components[this.#selectedIndex].giveFocus();
    }
  }

  isFocused(): boolean {
    const components = this.focusableListQry();
    return !!components.find((focusable) => focusable.isFocused());
  }
}
