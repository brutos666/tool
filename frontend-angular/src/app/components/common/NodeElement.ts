import { Component, ElementRef, inject, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'element',
  template: '<div></div>',
  host: {
    '[class.disabled]': 'disabled()',
    '[class.hidden]': 'hidden()',
  },
})
export class NodeElement {
  elementRef = inject(ElementRef);
  disabled = signal<boolean>(false);
  hidden = signal<boolean>(false);

  public getElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  public changeVisibility(visible: Boolean) {
    this.hidden.set(!visible);
  }
  public isVisible() {
    return !this.hidden();
  }

  setDisabled() {
    this.disabled.set(true);
  }
  setEnabled() {
    this.disabled.set(false);
  }
  isDisabled(): boolean {
    return this.disabled();
  }
}
