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
  menuOpened = signal<boolean>(false);
  burgerItemData!: Button;

  @ViewChild('menu') menu!: Menu;
  @ViewChild('burgerItem') burgerItem!: ActionButton;

  #resizeObserver!: ResizeObserver;

  #menuOrientation: 'horizontal' | 'vertical' | 'none' = 'none';

  constructor() {
    super();
    this.burgerItemData = new Button(
      'burgerButton',
      'Ouvrir le menu',
      'burger',
      'button',
      'burger',
    );
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
    const wasFocused = this.isFocused();

    this.#menuOrientation = 'horizontal';
    this.menuOpened.set(false);
    this.orientation.set('horizontal');
    this.menu.undoPopup();
    this.burgerItem.changeVisibility(false);
    this.burgerItem.changeTabAccess(false);
    if (wasFocused) {
      this.menu.giveFocus();
    }
  }

  /**
   * Ouverture/fermeture du menu contextuel
   */
  onMenuShowHide(event: ToggleEvent) {
    const wasFocused = this.isFocused();
    const menuOpen = !this.menuOpened();
    this.menuOpened.set(menuOpen);
    this.burgerItem.changeTabAccess(!menuOpen);
    if (wasFocused) {
      // Le focus est dans le menu
      this.giveFocus();
    }
  }

  override getElementToFocus(): HTMLElement {
    if (this.orientation() === 'horizontal' || this.menuOpened()) {
      return this.menu.getElementToFocus();
    }
    return this.burgerItem.getElementToFocus();
  }

  override isFocused(): boolean {
    return this.menu.isFocused() || this.burgerItem.isFocused();
  }
}
