import { Directive, input } from '@angular/core';

@Directive({
  selector: '[popup-button-directive]',
  host: {
    '[aria-expanded]': 'opened()',
    '[aria-controls]': 'target()',
    'aria-haspopup': 'true',
    popovertargetaction: 'toggle',
    '[attr.popovertarget]': 'target()',
  },
})
export class PopupButton {
  name = 'PopupButton';

  target = input.required<string>();
  opened = input.required<boolean>();
}
