import { Directive, input, model } from '@angular/core';
import { ShowButton } from './show-button.js';

@Directive({
  selector: '[show-popup-button-directive]',
  host: {
    '[aria-expanded]': 'show()',
    '[aria-pressed]': 'show()',
    'aria-haspopup': 'true',
  },
})
export class ShowPopupButton extends ShowButton {
  override name = 'ShowPopupButton';
}
