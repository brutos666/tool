import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { inputBinding, signal } from '@angular/core';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { Button } from '../action-button/button.js';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;

  const menuItems: Array<Button> = [];
  menuItems.push(new Button('id1', 'Action 1', ''));
  menuItems.push(new Button('id2', 'Action 2', ''));
  menuItems.push(new Button('id3', 'Action 3', ''));

  const itemsDataSignal = signal<Array<Button>>(menuItems);
  const orientationSignal = signal<'horizontal' | 'vertical'>('horizontal');

  beforeEach(async () => {
    orientationSignal.set('horizontal');

    await TestBed.configureTestingModule({
      imports: [Menu, ArrowNavigation],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu, {
      bindings: [
        inputBinding('menuItems', itemsDataSignal),
        inputBinding('navOrientation', orientationSignal),
      ],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
