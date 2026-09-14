import { AfterViewInit, Component, input, QueryList, viewChild, ViewChildren } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';
import { ActionButton } from '../action-button/action-button.js';
import { NodeElement } from '../common/NodeElement.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { Focusable } from '../../directives/focusable';

@Component({
  imports: [ActionButton, Focusable, ArrowNavigation],
  selector: 'menu-content',
  styleUrl: './menu.scss',
  templateUrl: './menu.html',
  providers: [ArrowNavigation],
})
export class Menu extends NodeElement implements AfterViewInit {
  menuItems = input.required<Array<MenuButton>>();
  menuOrientation = input<'horizontal' | 'vertical'>('horizontal');

  @ViewChildren(ActionButton) actionButtons!: QueryList<ActionButton>;

  private width!: number;
  private directive = viewChild.required(ArrowNavigation);

  override giveFocus() {
    this.directive().giveFocus();
  }
  override isFocused(): boolean {
    return this.directive().isFocused();
  }

  ngAfterViewInit(): void {
    const menu = this.getElement().querySelector('.menu');
    if (menu) {
      this.width = menu.clientWidth;
    }
  }

  getInitialWidth() {
    return this.width;
  }
  setInitialWidth(width: number) {
    this.width = width;
  }

  setPopup() {
    const menuElement = this.getElement();
    menuElement.popover = 'auto';

    // Indiquer aux boutons de fermer automatiquement la fenêtre
    this.actionButtons.forEach((actionButton) => {
      const element = actionButton.getElement() as HTMLButtonElement;
      element.popoverTargetElement = menuElement;
      element.popoverTargetAction = 'hide';
    });
  }
  undoPopup() {
    const menuElement = this.getElement();
    menuElement.popover = null;
  }
}
