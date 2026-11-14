import { Component, ElementRef, inject, input } from '@angular/core';

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

  disabled = input<boolean>(false);
  hidden = input<boolean>(false);

  public getElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
