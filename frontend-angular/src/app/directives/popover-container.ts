import { Directive, model } from '@angular/core';

@Directive({
  selector: '[popover-directive]',
  host: {
    popover: 'auto',
    '(toggle)': 'showHide()',
  },
})
export class PopOverContainer {
  name = 'PopOverContainer';

  show = model.required<boolean>();

  showHide() {
    const show = this.show();
    this.show.set(!show);
  }
}
