import { Directive, inject } from '@angular/core';
import { NodeElement } from '../components/common/NodeElement.js';

@Directive({
  selector: '[focusable-directive]',
})
export class Focusable {
  component = inject(NodeElement);

  getElementToFocus(): HTMLElement {
    return this.component.getElementToFocus();
  }

  giveFocus() {
    this.component.giveFocus();
  }
  public isFocused() {
    return this.component.isFocused();
  }
  public isFocusable(): boolean {
    return this.component.isFocusable();
  }

  changeTabAccess(access: boolean) {
    this.component.changeTabAccess(access);
  }
}
