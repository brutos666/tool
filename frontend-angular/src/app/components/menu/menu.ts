import { AfterViewInit, Component, input, QueryList, ViewChildren } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';
import { ActionButton } from '../action-button/action-button.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [ActionButton],
  selector: 'menu-content',
  styleUrl: './menu.scss',
  templateUrl: './menu.html',
  hostDirectives: [{ directive: ArrowNavigation, inputs: ['navOrientation'] }],
})
export class Menu extends NodeElement implements AfterViewInit {
  menuItems = input.required<Array<MenuButton>>();
  navOrientation = input<'horizontal' | 'vertical'>('horizontal');

  @ViewChildren(ActionButton) actionButtons!: QueryList<ActionButton>;

  private width!: number;

  ngAfterViewInit(): void {
    const menu = this.getElement().querySelector('.menu');
    if (menu) {
      this.width = menu.clientWidth;
    }
    const menuElement = this.getElement();
    if (menuElement.getAttribute('popover')) {
      // Indiquer aux boutons de fermer automatiquement la fenêtre
      this.actionButtons.forEach((actionButton) => {
        const element = actionButton.getElement() as HTMLButtonElement;
        element.popoverTargetElement = menuElement;
        element.popoverTargetAction = 'hide';
      });
    }
  }

  getInitialWidth() {
    return this.width;
  }
  setInitialWidth(width: number) {
    this.width = width;
  }
}
