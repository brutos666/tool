import { Directive, inject } from '@angular/core';
import { NodeElement } from '../components/common/NodeElement.js';

@Directive({
  selector: '[focusable-directive]',
})
export class Focusable {
  component = inject(NodeElement);

  giveFocus() {
    this.component.giveFocus();
  }
  public isFocused() {
    return this.component.isFocused();
  }

  changeTabAccess(access: boolean) {
    this.component.changeTabAccess(access);
  }
}
