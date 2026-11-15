import { Directive, input, model } from '@angular/core';

@Directive({
  selector: '[popover-directive]',
  host: {
    '[attr.popover]': 'popover()',
    '(toggle)': 'showHide()',
  },
})
export class PopOverContainer {
  name = 'PopOverContainer';

  show = model.required<boolean>();
  popover = input<'manual' | 'auto'>('auto');

  showHide() {
    const show = this.show();
    this.show.set(!show);
  }
}
