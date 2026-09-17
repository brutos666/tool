import { ElementRef, inject } from '@angular/core';

export class NodeElement {
  elementRef = inject(ElementRef);

  constructor() {}

  public getElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  public getElementToFocus(): HTMLElement {
    return this.getElement();
  }

  public giveFocus() {
    this.changeTabAccess(true);
    this.getElementToFocus().focus();
  }
  public isFocused(): boolean {
    return document.activeElement === this.getElementToFocus();
  }
  public isFocusable(): boolean {
    return (
      this.isVisible() && !this.isDisabled() && this.getElementToFocus().hasAttribute('tabIndex')
    );
  }
  public changeTabAccess(access: Boolean) {
    this.getElementToFocus().setAttribute('tabindex', access ? '0' : '-1');
  }
  public changeVisibility(visible: Boolean) {
    if (visible) {
      this.getElement().classList.remove('hidden');
    } else {
      this.getElement().classList.add('hidden');
    }
  }
  public isVisible() {
    return !this.getElement().classList.contains('hidden');
  }

  setDisabled() {
    this.getElement().classList.add('disabled');
  }

  setEnabled() {
    this.getElement().classList.remove('disabled');
  }

  isDisabled() {
    return this.getElement().classList.contains('disabled');
  }
}
