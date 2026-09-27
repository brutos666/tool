import { Directive, effect, input, InputSignal, model } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { ArrowNavigation } from './arrow-navigation.js';

@Directive({
  selector: '[tree-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: TreeNavigation }],
})
export class TreeNavigation extends ArrowNavigation {
  override name = 'TreeNavigation';
  override navOrientation = input<'horizontal' | 'vertical'>('vertical');

  open: boolean = false;

  constructor() {
    super();
  }

  setOpen(open: boolean) {
    this.open = open;
    if (!open) {
      this.navEnabled.set(false);
    }
  }
}
