import { Directive, input, model } from '@angular/core';

@Directive({
  selector: '[show-button-directive]',
  host: {
    '[aria-controls]': 'target()',
    '(click)': 'show.set(!show())',
  },
})
export class ShowButton {
  name = 'ShowButton';

  target = input.required<string>();
  // La cible doit être affichée en testant @if (show())
  show = model.required<boolean>();
}
