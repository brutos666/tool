import { ChangeDetectorRef, Component, effect, inject, input, signal } from '@angular/core';
import { Button } from '../action-button/button';
import { Menu } from '../menu/menu.js';
import { MenuOrientation } from '../../directives/menu-orientation.js';
import { Composite } from '../common/Composite.js';
import { ManualNavigation } from '../../directives/manual-navigation.js';
import { PopupButton } from '../../directives/popup-button';
import { PopOverContainer } from '../../directives/popover-container';
import { FocusableButton } from '../action-button/focusable-button';

@Component({
  imports: [Menu, PopupButton, PopOverContainer, FocusableButton],
  selector: 'menu-bar',
  styleUrl: './menu-bar.scss',
  templateUrl: './menu-bar.html',
  hostDirectives: [MenuOrientation, ManualNavigation],
  host: {
    '[aria-label]': 'label()',
  },
})
export class MenuBar extends Composite {
  changeDetectorRef = inject(ChangeDetectorRef);
  menuOrientation = inject(MenuOrientation);

  menuItems = input.required<Array<Button>>();
  label = input.required<string>();
  menuOpened = signal<boolean>(false);

  burgerItemData!: Button;

  constructor() {
    super();
    this.burgerItemData = new Button('burgerButton', 'Ouvrir le menu', 'burger');
    effect(() => {
      if (this.menuOpened()) {
        this.setFocusIndex(1);
      }
      if (this.menuOrientation.orientation() === 'horizontal') {
        this.menuOpened.set(false);
      }
    });
  }
}
