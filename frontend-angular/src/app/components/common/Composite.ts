import { Component, effect, inject, viewChildren } from '@angular/core';
import { Navigable } from './Navigable.js';
import { NodeElement } from './NodeElement.js';
import { Navigate } from './Navigate.js';

@Component({
  imports: [],
  selector: '',
  template: '<div></div>',
})
export class Composite extends NodeElement {
  focusableListQry = viewChildren(Navigable);

  private navigation = inject(Navigate, { self: true, optional: true });

  constructor() {
    super();
    if (!this.navigation) {
      return;
    }
    effect(() => {
      this.navigation?.setFocusableList(this.focusableListQry());
    });
  }

  setFocusIndex(focusIndex: number) {
    this.navigation?.setFocusIndex(focusIndex);
  }
}
