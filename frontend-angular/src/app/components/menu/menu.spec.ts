import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { inputBinding, signal, Signal } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as any;

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let itemsDataSignal: Signal<Array<MenuButton>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
    }).compileComponents();

    const menuItems:Array<MenuButton> = [];
    menuItems.push(new MenuButton('Action 1'));
    menuItems.push(new MenuButton('Action 2'));
    menuItems.push(new MenuButton('Action 3'));
    itemsDataSignal = signal<Array<MenuButton>>(menuItems);

    fixture = TestBed.createComponent(Menu, {
      bindings: [
        inputBinding('menuItems', itemsDataSignal)
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
