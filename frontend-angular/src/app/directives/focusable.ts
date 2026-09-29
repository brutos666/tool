import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[focusable-directive]',
})
export class Focusable implements Navigable {
  name = 'Focusable';

  private element = inject(ElementRef).nativeElement;

  // Remonte les parents jusqu'au parent répondant au provider ManualNavigation
  private parentNav = inject(Navigate, { skipSelf: true, optional: true });
  private destroyRef = inject(DestroyRef);

  constructor() {
    // S'enregistrer auprès de la navigation parente
    this.parentNav?.registerChild(this);
    this.destroyRef.onDestroy(() => this.parentNav?.unregisterChild(this));
  }
  getParentNavigation(): Navigate | null {
    return this.parentNav;
  }

  setElement(element: HTMLElement) {
    this.element = element;
    this.changeTabAccess(false);
  }
  getElement(): HTMLElement {
    return this.element;
  }

  giveFocus() {
    this.getElement().focus();
  }
  isFocused(): boolean {
    return document.activeElement === this.getElement();
  }
  isFocusable(): boolean {
    const classList = this.getElement().classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  changeTabAccess(access: boolean) {
    this.getElement().setAttribute('tabindex', access ? '0' : '-1');
  }
}
