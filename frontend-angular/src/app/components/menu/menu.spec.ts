import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { MenuButton } from '../action-button/menu-button.js';
import { input, inputBinding, signal } from '@angular/core';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;

  const menuItems: Array<MenuButton> = [];
  menuItems.push(new MenuButton('id1', 'Action 1'));
  menuItems.push(new MenuButton('id2', 'Action 2'));
  menuItems.push(new MenuButton('id3', 'Action 3'));

  const itemsDataSignal = signal<Array<MenuButton>>(menuItems);
  const orientationSignal = signal<'horizontal' | 'vertical'>('horizontal');

  beforeEach(async () => {
    orientationSignal.set('horizontal');

    await TestBed.configureTestingModule({
      imports: [Menu, ArrowNavigation],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu, {
      bindings: [
        inputBinding('menuItems', itemsDataSignal),
        inputBinding('menuOrientation', orientationSignal),
      ],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
