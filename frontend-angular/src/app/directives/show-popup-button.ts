import { Directive, input, model } from '@angular/core';

@Directive({
  selector: '[show-popup-button-directive]',
  host: {
    '[aria-expanded]': 'show()',
    '[aria-pressed]': 'show()',
    '[aria-controls]': 'target()',
    'aria-haspopup': 'true',
    '(click)': 'show.set(!show())',
  },
})
export class ShowPopupButton {
  name = 'PopupButton';

  target = input.required<string>();
  // La cible doit être affichée en testant @if (show())
  show = model.required<boolean>();
}
