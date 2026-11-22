import { Component, effect, inject, model } from '@angular/core';
import { Composite } from './Composite.js';
import { TabNavigation } from '../../directives/tab-navigation.js';

@Component({
  imports: [],
  selector: 'popup',
  template: '<div></div>',
  hostDirectives: [TabNavigation],
})
export class Popup extends Composite {
  show = model<boolean>(false);
  focusIndex = 0;
  tabNavigation = inject(TabNavigation, { self: true });

  constructor() {
    super();
    effect(() => {
      if (this.show()) {
        // Donner le focus à l'ouverture
        this.setFocusIndex(this.focusIndex);
        this.tabNavigation.giveFocus();
      }
    });
  }
}
