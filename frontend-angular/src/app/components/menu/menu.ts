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
  selector: 'app-menu',
  styleUrl: './menu.scss',
  templateUrl: './menu.html',
})
export class Menu extends NodeElement implements AfterViewInit, OnDestroy {
  menuItems = input.required<Array<MenuButton>>();
  burgerItem!: Button;

  @ViewChild('menuBar') menuBar!: ElementRef;
  @ViewChild('menu') menu!: ElementRef;
  @ViewChildren(ActionButton) actionButtons!: QueryList<ActionButton>;

  #horizontal!: Boolean;
  #font_size!: number;
  #selectedIndex = -1;

  #resizeObserver!: ResizeObserver;

  #menuOpen:Boolean = false;

  constructor() {
    super()
    this.burgerItem = new Button('Ouvrir le menu', '☰', 'button', 'burger');
  }

  ngAfterViewInit() {
    this.#resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this));
    this.#resizeObserver.observe(this.menuBar.nativeElement, { box: 'content-box' });

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
      if (!this.#font_size) {
        this.#font_size = parseFloat(getComputedStyle(this.menu.nativeElement).fontSize);
      }
      if (boxSize.inlineSize / this.#font_size > 50) {
        this.changeToHorizontalMenu();
      } else {
        this.changeToBurgerMenu();
      }
    }
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
   * @param {'open'|'hide'} state : État ouvert ou fermé
   * @returns
   */
  onMenuShowHide(state: string) {
    const burgerItem = this.getBurgerItem();
    burgerItem.changeTabAccess(state === 'open' ? false : true);
    if (state === 'open') {
      this.#menuOpen = true;
      this.giveFocusToMenu();
    } else {
      this.#menuOpen = false;
      this.giveFocusToBurger();
    }
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
