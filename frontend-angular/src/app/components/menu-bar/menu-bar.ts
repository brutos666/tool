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

@Component({
  imports: [ActionButton, Menu],
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
  @ViewChild('burgerItem') burgerItem!: ActionButton;

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
      const orientation = this.menuOrientation.orientation();
      if (orientation === 'vertical') {
        this.menu.setPopup();
        this.burgerItemData.setVisible(true);
        // Attendre la prise en compte du changement de visibilité avant de donner le focus
        this.changeDetectorRef.detectChanges();
        this.setFocusIndex(0);
        return;
      }
      this.menu?.undoPopup();
      this.menuOpened.set(false);
      this.setFocusIndex(1);
      this.burgerItemData.setVisible(false);
    });
  }

  /**
   * Ouverture/fermeture du menu contextuel
   */
  onMenuShowHide(event: ToggleEvent) {
    const menuOpen = !this.menuOpened();
    this.menuOpened.set(menuOpen);
    this.setFocusIndex(menuOpen ? 1 : 0);
  }
}
