import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { ActionButton } from '../action-button/action-button';
import { Button } from '../action-button/button';
import { MenuButton } from '../action-button/menu-button';
import { Menu } from '../menu/menu.js';
import { MenuOrientation } from '../../directives/menu-orientation.js';
import { Composite } from '../common/Composite.js';
import { ManualNavigation } from '../../directives/manual-navigation.js';
import { PopupButton } from '../../directives/popup-button';
import { PopOverContainer } from '../../directives/popover-container';

@Component({
  imports: [ActionButton, Menu, PopupButton, PopOverContainer],
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

  menuItems = input.required<Array<MenuButton>>();
  label = input.required<String>();
  menuOpened = signal<boolean>(false);

  burgerItemData!: Button;

  @ViewChild('menu') menu!: Menu;

  constructor() {
    super();
    this.burgerItemData = new Button(
      'burgerButton',
      'Ouvrir le menu',
      'burger',
      'button',
      'burger',
    );
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
