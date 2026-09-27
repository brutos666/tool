import { Directive } from '@angular/core';

@Directive({
  selector: '[no-focusable-directive]',
  host: {
    '[attr.tabindex]': '-1',
  },
})
export class NoFocusable {
  name = 'NoFocusable';
}
