import { Directive, ElementRef, inject, signal } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[focusable-directive]',
  host: {
    '[attr.tabindex]': 'accessible() ? 0 : -1',
  },
})
export class Focusable implements Navigable {
  name = 'Focusable';

  elementRef = inject(ElementRef);
  accessible = signal<boolean>(false);

  // Remonte les parents jusqu'au parent répondant au provider ManualNavigation
  private parentNav = inject(Navigate, { skipSelf: true, optional: true });

  constructor() {
    // S'enregistrer auprès de la navigation parente
    this.parentNav?.registerChild(this);
  }

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
