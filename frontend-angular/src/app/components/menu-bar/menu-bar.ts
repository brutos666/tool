import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActionButton } from '../action-button/action-button';
import { Button } from '../action-button/button';
import { MenuButton } from '../action-button/menu-button';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [ActionButton],
  selector: 'menu-bar',
  styleUrl: './menu-bar.scss',
  templateUrl: './menu-bar.html',
  host: {
    '[aria-label]': 'label()',
  },
})
export class MenuBar extends NodeElement implements AfterViewInit, OnDestroy {
  menuItems = input.required<Array<MenuButton>>();
  label = input.required<String>();
  burgerItem!: Button;

  @ViewChild('menu') menu!: ElementRef;
  @ViewChildren(ActionButton) actionButtons!: QueryList<ActionButton>;

  #horizontal!: Boolean;
  #menuWidth!: number;
  #selectedIndex = -1;

  #resizeObserver!: ResizeObserver;

  #menuOpen: Boolean = false;

  constructor() {
    super();
    this.burgerItem = new Button('Ouvrir le menu', 'burger', 'button', 'burger');
  }

  setMenuWidth(width: number) {
    this.#menuWidth = width;
  }
  setHorizontal(horizontal: Boolean) {
    this.#horizontal = horizontal;
  }

  ngAfterViewInit() {
    this.#resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this));
    this.#resizeObserver.observe(this.getElement(), { box: 'content-box' });

    const burgerItem = this.getBurgerItem();
    const burgerElement = burgerItem.getElement() as HTMLButtonElement;
    burgerElement.ariaHasPopup = 'true';
    burgerElement.popoverTargetAction = 'toggle';
    burgerElement.popoverTargetElement = this.menu.nativeElement;
    burgerElement.setAttribute('aria-controls', 'menu');
    burgerElement.classList.add('menu__button');

    this.focusItem(0);
  }

  ngOnDestroy() {
    this.#resizeObserver?.disconnect();
  }

  sizeHasChanged(entries: Array<ResizeObserverEntry>) {
    for (const entry of entries) {
      if (!entry.contentBoxSize) {
        continue;
      }
      const boxSize = entry.contentBoxSize[0];
      if (!this.#menuWidth) {
        this.#menuWidth = parseFloat(getComputedStyle(this.menu.nativeElement).width);
      }
      if (boxSize.inlineSize > this.#menuWidth) {
        this.changeToHorizontalMenu();
      } else {
        this.changeToBurgerMenu();
      }
    }
  }

  isHorizontal() {
    return this.#horizontal === true;
  }

  changeToBurgerMenu() {
    if (this.#horizontal === false) {
      return;
    }
    this.onMenuChange('vertical');
    this.#horizontal = false;
    this.menu.nativeElement.classList.add('menu__actions-vertical');
    this.menu.nativeElement.popover = 'auto';

    // Indiquer aux boutons de fermer automatiquement la fenêtre
    this.getMenuItems().forEach((actionButton) => {
      const element = actionButton.getElement() as HTMLButtonElement;
      element.popoverTargetElement = this.menu.nativeElement;
      element.popoverTargetAction = 'hide';
    });
  }

  changeToHorizontalMenu() {
    if (this.#horizontal) {
      return;
    }
    this.onMenuChange('horizontal');
    this.#horizontal = true;

    this.menu.nativeElement.classList.remove('menu__actions-vertical');
    this.menu.nativeElement.popover = null;
  }

  onMenuChange(orientation: 'vertical' | 'horizontal') {
    const wasFocused = this.isFocused();
    const burgerItem = this.getBurgerItem();
    if (orientation === 'vertical') {
      burgerItem.changeVisibility(true);
      burgerItem.changeTabAccess(true);
      if (wasFocused) {
        this.giveFocusToBurger();
      }
      return;
    }
    burgerItem.changeVisibility(false);
    burgerItem.changeTabAccess(false);
    if (wasFocused) {
      this.giveFocusToMenu();
    }
  }

  /**
   * Ouverture/fermeture du menu contextuel
   */
  onMenuShowHide() {
    const burgerItem = this.getBurgerItem();
    if (this.#menuOpen) {
      this.#menuOpen = false;
      burgerItem.changeTabAccess(true);
      this.giveFocusToBurger();
      return;
    }
    this.#menuOpen = true;
    burgerItem.changeTabAccess(false);
    this.giveFocusToMenu();
  }

  getBurgerItem() {
    return this.actionButtons.first;
  }
  getMenuItems() {
    const menuItems = this.actionButtons.toArray();
    menuItems.shift();
    return menuItems;
  }

  onKeyDown(event: KeyboardEvent) {
    const menuItems = this.getMenuItems();
    const nbItems = menuItems.length;
    if (nbItems === 0) {
      return;
    }
    if (this.#horizontal && !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return;
    }
    if (!this.#horizontal && !['ArrowUp', 'ArrowDown'].includes(event.key)) {
      return;
    }

    let selectedIndex = this.#selectedIndex;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        selectedIndex++;
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        selectedIndex--;
        event.preventDefault();
        break;
    }

    if (selectedIndex === -1 || selectedIndex === nbItems) {
      return;
    }
    this.focusItem(selectedIndex);
  }

  focusItem(index: number) {
    const menuItems = this.getMenuItems();
    if (this.#selectedIndex >= 0 && this.#selectedIndex < menuItems.length) {
      menuItems[this.#selectedIndex].changeTabAccess(false);
    }
    this.#selectedIndex = index;
    this.giveFocusToMenu();
  }

  override isFocused() {
    return !!this.actionButtons.find((item) => item.isFocused());
  }
  override giveFocus() {
    if (this.#horizontal || this.#menuOpen) {
      this.giveFocusToMenu();
    } else {
      this.giveFocusToBurger();
    }
  }

  giveFocusToBurger() {
    const burgerItem = this.getBurgerItem();
    burgerItem.giveFocus();
  }
  giveFocusToMenu() {
    const menuItems = this.getMenuItems();
    menuItems[this.#selectedIndex].giveFocus();
  }
}
