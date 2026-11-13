import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[focusable-directive]',
})
export class Focusable implements Navigable {
  name = 'Focusable';

  protected accessible: boolean = false;
  protected mustGiveFocus: boolean = false;
  protected containFocus: boolean = false;

  private element = inject(ElementRef).nativeElement;

  // Remonte les parents jusqu'au parent répondant au provider ManualNavigation
  private parentNav = inject(Navigate, { skipSelf: true, optional: true });
  private destroyRef = inject(DestroyRef);

  constructor() {
    // S'enregistrer auprès de la navigation parente
    this.parentNav?.registerChild(this);
    this.destroyRef.onDestroy(() => this.parentNav?.unregisterChild(this));
    afterNextRender({
      // Note : après toutes les modifications appliquées au DOM suite des changements (signal, événement)
      read: () => {
        this.applyTabAccess();
        if (this.mustGiveFocus) {
          this.giveFocus();
          this.mustGiveFocus = false;
        }
      },
    });
  }
  getParentNavigation(): Navigate | null {
    return this.parentNav;
  }

  setElement(element: HTMLElement) {
    this.element = element;
  }
  getElement(): HTMLElement {
    return this.element;
  }

  giveFocus() {
    this.mustGiveFocus = true;
    this.getElement().focus();
  }
  removeFocus() {
    this.mustGiveFocus = false;
    this.containFocus = false;
  }
  isFocused(): boolean {
    return document.activeElement === this.getElement();
  }
  isFocusable(): boolean {
    const classList = this.getElement().classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  changeTabAccess(access: boolean) {
    if (!access) {
      this.removeFocus();
    }
    this.accessible = access;
    this.applyTabAccess();
  }

  applyTabAccess() {
    this.getElement().setAttribute('tabindex', this.accessible ? '0' : '-1');
  }
}
