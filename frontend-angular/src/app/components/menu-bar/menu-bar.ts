import { AfterViewInit, Component, input, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActionButton } from '../action-button/action-button';
import { Button } from '../action-button/button';
import { MenuButton } from '../action-button/menu-button';
import { NodeElement } from '../common/NodeElement.js';
import { Menu } from '../menu/menu.js';

@Component({
  imports: [ActionButton, Menu],
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
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  burgerItemData!: Button;

  @ViewChild('menu') menu!: Menu;
  @ViewChild('burgerItem') burgerItem!: ActionButton;

  #resizeObserver!: ResizeObserver;

  #menuOpen: Boolean = false;
  #menuOrientation: 'horizontal' | 'vertical' | 'none' = 'none';

  constructor() {
    super();
    this.burgerItemData = new Button('Ouvrir le menu', 'burger', 'button', 'burger');
  }

  setMenuWidth(width: number) {
    this.menu.setInitialWidth(width);
  }
  setOrientation(orientation: 'horizontal' | 'vertical') {
    this.orientation.set(orientation);
  }

  ngAfterViewInit() {
    this.#resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this));
    this.#resizeObserver.observe(this.getElement(), { box: 'content-box' });

    const burgerElement = this.burgerItem.getElement() as HTMLButtonElement;
    burgerElement.ariaHasPopup = 'true';
    burgerElement.popoverTargetAction = 'toggle';
    burgerElement.popoverTargetElement = this.menu.getElement();
    burgerElement.setAttribute('aria-controls', 'menuContent');
    burgerElement.classList.add('menu__button');
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
      if (boxSize.inlineSize > this.menu.getInitialWidth()) {
        this.changeToHorizontalMenu();
      } else {
        this.changeToBurgerMenu();
      }
    }
  }

  isHorizontal() {
    return this.#menuOrientation === 'horizontal';
  }

  changeToBurgerMenu() {
    if (this.#menuOrientation === 'vertical') {
      return;
    }
    this.#menuOrientation = 'vertical';

    const wasFocused = this.isFocused();
    this.menu.setPopup();
    this.burgerItem.changeVisibility(true);
    this.burgerItem.changeTabAccess(true);
    if (wasFocused) {
      this.burgerItem.giveFocus();
    }
    this.orientation.set('vertical');
  }

  changeToHorizontalMenu() {
    if (this.#menuOrientation === 'horizontal') {
      return;
    }
    this.#menuOrientation = 'horizontal';

    const wasFocused = this.isFocused();
    this.menu.undoPopup();
    this.burgerItem.changeVisibility(false);
    this.burgerItem.changeTabAccess(false);
    if (wasFocused) {
      this.menu.giveFocus();
    }
    this.orientation.set('horizontal');
  }

  /**
   * Ouverture/fermeture du menu contextuel
   */
  onMenuShowHide() {
    if (this.#menuOpen) {
      this.#menuOpen = false;
      this.burgerItem.changeTabAccess(true);
      this.burgerItem.giveFocus();
      return;
    }
    this.#menuOpen = true;
    this.burgerItem.changeTabAccess(false);
    this.menu.giveFocus();
  }

  override isFocused() {
    return this.burgerItem.isFocused() || this.menu.isFocused();
  }
  override giveFocus() {
    if (this.orientation() === 'horizontal' || this.#menuOpen) {
      this.menu.giveFocus();
    } else {
      this.burgerItem.giveFocus();
    }
  }
}
