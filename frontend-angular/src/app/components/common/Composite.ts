import { Component, inject } from '@angular/core';
import { NodeElement } from './NodeElement.js';
import { Navigate } from './Navigate.js';

@Component({
  imports: [],
  selector: '',
  template: '<div></div>',
})
export class Composite extends NodeElement {
  navigation = inject(Navigate, { self: true, optional: true });

  constructor() {
    super();
    if (!this.navigation) {
      return;
    }
  }

  /** Modifie l'élément courant sans perdre le focus */
  setFocusIndex(focusIndex: number) {
    this.navigation?.setFocusIndex(focusIndex);
  }
}
