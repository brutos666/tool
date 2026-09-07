import { ElementRef, inject, Signal } from '@angular/core';

export class NodeElement {
  elementRef = inject(ElementRef);

  constructor() {}

  public getElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  public giveFocus() {
    this.changeTabAccess(true);
    this.getElement().focus();
  }
  public isFocused() {
    return document.activeElement === this.getElement();
  }
  public changeTabAccess(access: Boolean) {
    this.getElement().setAttribute('tabindex', access ? '0' : '-1');
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
}
