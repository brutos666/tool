import { Directive, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[focusable-directive]',
  providers: [{ provide: Navigable, useExisting: Focusable }],
  host: {
    '[attr.tabindex]': 'accessible() ? 0 : -1',
  },
})
export class Focusable implements Navigable {
  elementRef = inject(ElementRef);
  accessible = signal<boolean>(false);

  giveFocus() {
    this.elementRef.nativeElement.focus();
  }
  isFocused(): boolean {
    return document.activeElement === this.elementRef.nativeElement;
  }
  isFocusable(): boolean {
    const classList = this.elementRef.nativeElement.classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  changeTabAccess(access: boolean) {
    this.accessible.set(access);
  }
}
